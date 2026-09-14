package com.sliit.vbs.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating a comment.
 *
 * @author IT25101638
 */
public class CommentRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    private String content;

    public Long getVideoId() { return videoId; }
    public void setVideoId(Long videoId) { this.videoId = videoId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
