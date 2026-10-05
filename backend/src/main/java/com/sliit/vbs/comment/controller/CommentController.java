package com.sliit.vbs.comment.controller;

import com.sliit.vbs.comment.dto.CommentRequest;
import com.sliit.vbs.comment.dto.CommentResponse;
import com.sliit.vbs.comment.service.CommentService;
import com.sliit.vbs.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing video comments.
 * Provides endpoints for posting, editing, hiding, pinning, and deleting comments.
 *
 * @author IT25101638
 */
@RestController
@RequestMapping("/api/v1/comments")
@Tag(name = "Comments", description = "Comment Manager - Video Comment Management APIs")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @Operation(summary = "Post a new comment on a video")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentResponse response = commentService.addComment(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Comment posted successfully"));
    }

    @GetMapping("/video/{videoId}")
    @Operation(summary = "Get all visible comments for a video (pinned first)")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsByVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getCommentsByVideo(videoId)));
    }

    @GetMapping("/video/{videoId}/all")
    @Operation(summary = "Get all comments including hidden ones (Comment Manager only)")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getAllCommentsByVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getAllCommentsByVideo(videoId)));
    }

    @GetMapping("/video/{videoId}/pinned")
    @Operation(summary = "Get pinned comments for a video")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getPinnedComments(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getPinnedCommentsByVideo(videoId)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getMyComments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getCommentsByUser(userDetails.getUsername())));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all platform comments (for Comment Manager)")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getAllComments() {
        return ResponseEntity.ok(ApiResponse.success(commentService.getAllComments()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a comment (owner or Comment Manager)")
    public ResponseEntity<ApiResponse<CommentResponse>> editComment(
            @PathVariable Long id,
            @RequestParam String content,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(commentService.editComment(id, content, userDetails.getUsername()), "Comment updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a comment (owner or Comment Manager)")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        commentService.deleteComment(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }

    @PatchMapping("/{id}/pin")
    @Operation(summary = "Pin a comment (Comment Manager only)")
    public ResponseEntity<ApiResponse<CommentResponse>> pinComment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.pinComment(id), "Comment pinned"));
    }

    @PatchMapping("/{id}/unpin")
    @Operation(summary = "Unpin a comment (Comment Manager only)")
    public ResponseEntity<ApiResponse<CommentResponse>> unpinComment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.unpinComment(id), "Comment unpinned"));
    }

    @PatchMapping("/{id}/hide")
    @Operation(summary = "Hide a comment (Comment Manager only)")
    public ResponseEntity<ApiResponse<CommentResponse>> hideComment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.hideComment(id), "Comment hidden"));
    }

    @PatchMapping("/{id}/unhide")
    @Operation(summary = "Unhide a comment (Comment Manager only)")
    public ResponseEntity<ApiResponse<CommentResponse>> unhideComment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.unhideComment(id), "Comment unhidden"));
    }

    @PatchMapping("/{id}/like")
    @Operation(summary = "Like a comment")
    public ResponseEntity<ApiResponse<CommentResponse>> likeComment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.likeComment(id), "Comment liked"));
    }
}
