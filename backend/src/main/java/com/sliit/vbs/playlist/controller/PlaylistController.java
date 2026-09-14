package com.sliit.vbs.playlist.controller;

import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.playlist.dto.PlaylistRequest;
import com.sliit.vbs.playlist.dto.PlaylistResponse;
import com.sliit.vbs.playlist.dto.PlaylistVideoResponse;
import com.sliit.vbs.playlist.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playlists")
@Tag(name = "Playlists", description = "Playlist Manager APIs")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping
    @Operation(summary = "Create a new playlist")
    public ResponseEntity<ApiResponse<PlaylistResponse>> createPlaylist(
            @Valid @RequestBody PlaylistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Playlist created", playlistService.createPlaylist(request, userDetails.getUsername())));
    }

    @GetMapping
    @Operation(summary = "Get user's playlists")
    public ResponseEntity<ApiResponse<List<PlaylistResponse>>> getMyPlaylists(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(playlistService.getUserPlaylists(userDetails.getUsername())));
    }

    @GetMapping("/public")
    @Operation(summary = "Get all public playlists")
    public ResponseEntity<ApiResponse<List<PlaylistResponse>>> getPublicPlaylists() {
        return ResponseEntity.ok(ApiResponse.success(playlistService.getPublicPlaylists()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a playlist by ID")
    public ResponseEntity<ApiResponse<PlaylistResponse>> getPlaylist(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(playlistService.getPlaylistById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a playlist")
    public ResponseEntity<ApiResponse<PlaylistResponse>> updatePlaylist(
            @PathVariable Long id,
            @Valid @RequestBody PlaylistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Playlist updated", playlistService.updatePlaylist(id, request, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a playlist")
    public ResponseEntity<ApiResponse<Void>> deletePlaylist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        playlistService.deletePlaylist(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Playlist deleted", null));
    }

    @PostMapping("/{playlistId}/videos/{videoId}")
    @Operation(summary = "Add a video to a playlist")
    public ResponseEntity<ApiResponse<PlaylistVideoResponse>> addVideoToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video added to playlist", playlistService.addVideoToPlaylist(playlistId, videoId, userDetails.getUsername())));
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    @Operation(summary = "Remove a video from a playlist")
    public ResponseEntity<ApiResponse<Void>> removeVideoFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        playlistService.removeVideoFromPlaylist(playlistId, videoId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Video removed from playlist", null));
    }

    @GetMapping("/{playlistId}/videos")
    @Operation(summary = "Get all videos in a playlist")
    public ResponseEntity<ApiResponse<List<PlaylistVideoResponse>>> getVideosInPlaylist(
            @PathVariable Long playlistId) {
        return ResponseEntity.ok(ApiResponse.success(playlistService.getVideosInPlaylist(playlistId)));
    }
}
