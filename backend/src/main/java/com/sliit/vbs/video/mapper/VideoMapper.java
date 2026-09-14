package com.sliit.vbs.video.mapper;

import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.entity.Video;
import org.springframework.stereotype.Component;

@Component
public class VideoMapper {

    public VideoResponse toResponse(Video video) {
        if (video == null) return null;

        VideoResponse dto = new VideoResponse();
        dto.setId(video.getId());
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setVideoUrl(video.getVideoUrl());
        dto.setThumbnailUrl(video.getThumbnailUrl());
        dto.setDurationSeconds(video.getDurationSeconds());
        dto.setFormattedDuration(formatDuration(video.getDurationSeconds()));
        dto.setViewsCount(video.getViewsCount());
        dto.setLikesCount(video.getLikesCount());
        dto.setStatus(video.getStatus());
        dto.setTags(video.getTags());

        if (video.getCreator() != null) {
            dto.setCreatorId(video.getCreator().getId());
            dto.setCreatorName(video.getCreator().getFullName());
            dto.setCreatorAvatar(video.getCreator().getAvatarUrl());
        }

        if (video.getCategory() != null) {
            dto.setCategoryId(video.getCategory().getId());
            dto.setCategoryName(video.getCategory().getName());
        }

        dto.setCreatedAt(video.getCreatedAt());
        dto.setUpdatedAt(video.getUpdatedAt());

        return dto;
    }

    private String formatDuration(Integer totalSeconds) {
        if (totalSeconds == null || totalSeconds <= 0) return "00:00";
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        } else {
            return String.format("%02d:%02d", minutes, seconds);
        }
    }
}
