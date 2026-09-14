package com.sliit.vbs.video.controller;

import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.dto.CreatorDashboardSummaryDto;
import com.sliit.vbs.video.dto.VideoCreateRequest;
import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.dto.VideoUpdateRequest;
import com.sliit.vbs.video.service.VideoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    // ========================================================================
    // PUBLIC ENDPOINTS (Shared Browsing & Watching)
    // ========================================================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoResponse>>> getAllVideos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "date") String sort) {

        List<VideoResponse> videos = videoService.getAllVideos(search, categoryId, sort);
        return ResponseEntity.ok(ApiResponse.success(videos, "Videos retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoResponse>> getVideoById(@PathVariable Long id) {
        VideoResponse video = videoService.getVideoById(id);
        return ResponseEntity.ok(ApiResponse.success(video, "Video retrieved successfully"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<VideoResponse>> likeVideo(@PathVariable Long id) {
        VideoResponse video = videoService.likeVideo(id);
        return ResponseEntity.ok(ApiResponse.success(video, "Video liked"));
    }

    // ========================================================================
    // CONTENT CREATOR ENDPOINTS (Role: ROLE_CONTENT_CREATOR)
    // ========================================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<VideoResponse>> createVideo(
            @Valid @RequestBody VideoCreateRequest request,
            @AuthenticationPrincipal User creator) {

        VideoResponse video = videoService.createVideo(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(video, "Video created and published successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<VideoResponse>> updateVideo(
            @PathVariable Long id,
            @Valid @RequestBody VideoUpdateRequest request,
            @AuthenticationPrincipal User user) {

        VideoResponse video = videoService.updateVideo(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(video, "Video updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        videoService.deleteVideo(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Video deleted successfully"));
    }

    @GetMapping("/creator/my-videos")
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<List<VideoResponse>>> getMyVideos(
            @AuthenticationPrincipal User creator) {

        List<VideoResponse> myVideos = videoService.getCreatorVideos(creator);
        return ResponseEntity.ok(ApiResponse.success(myVideos, "Creator video library retrieved"));
    }

    @GetMapping("/creator/analytics")
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<CreatorDashboardSummaryDto>> getCreatorAnalytics(
            @AuthenticationPrincipal User creator) {

        CreatorDashboardSummaryDto analytics = videoService.getCreatorAnalytics(creator);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Creator studio analytics retrieved"));
    }

    @PostMapping("/creator/upload-media")
    @PreAuthorize("hasAuthority('ROLE_CONTENT_CREATOR')")
    public ResponseEntity<ApiResponse<String>> uploadMediaFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File cannot be empty"));
        }

        String uploadDir = "uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
        Path targetPath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/" + fileName;
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "Media file uploaded successfully"));
    }
}
