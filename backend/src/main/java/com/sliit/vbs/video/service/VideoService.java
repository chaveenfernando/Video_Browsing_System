package com.sliit.vbs.video.service;

import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.dto.CreatorDashboardSummaryDto;
import com.sliit.vbs.video.dto.VideoCreateRequest;
import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.dto.VideoUpdateRequest;

import java.util.List;

public interface VideoService {

    VideoResponse createVideo(VideoCreateRequest request, User creator);

    VideoResponse updateVideo(Long id, VideoUpdateRequest request, User user);

    void deleteVideo(Long id, User user);

    VideoResponse getVideoById(Long id);

    VideoResponse likeVideo(Long id);

    List<VideoResponse> getAllVideos(String query, Long categoryId, String sortStrategy);

    List<VideoResponse> getCreatorVideos(User creator);

    CreatorDashboardSummaryDto getCreatorAnalytics(User creator);
}
