package com.sliit.vbs.favourite.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for adding a video to favourites.
 *
 * @author IT25103653
 */
public class FavouriteRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    public Long getVideoId() {
        return videoId;
    }

    public void setVideoId(Long videoId) {
        this.videoId = videoId;
    }
}
