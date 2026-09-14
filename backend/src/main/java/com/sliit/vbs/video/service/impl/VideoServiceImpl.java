package com.sliit.vbs.video.service.impl;

import com.sliit.vbs.category.entity.Category;
import com.sliit.vbs.category.repository.CategoryRepository;
import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.pattern.factory.Notification;
import com.sliit.vbs.pattern.factory.NotificationFactory;
import com.sliit.vbs.pattern.strategy.VideoSortContext;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.dto.CreatorDashboardSummaryDto;
import com.sliit.vbs.video.dto.VideoCreateRequest;
import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.dto.VideoUpdateRequest;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.entity.VideoStatus;
import com.sliit.vbs.video.mapper.VideoMapper;
import com.sliit.vbs.video.repository.VideoRepository;
import com.sliit.vbs.video.service.VideoService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ============================================================================
 * VIVA EXPLANATION: VideoServiceImpl (Content Creator Domain Implementation)
 * ----------------------------------------------------------------------------
 * Key architectural design points:
 * 1. STRATEGY PATTERN IN ACTION:
 *    - In getAllVideos(), instead of complex if-else blocks hardcoding sorting logic,
 *      we delegate sorting to 'videoSortContext.executeSort(rawList, sortStrategy)'.
 * 2. FACTORY PATTERN IN ACTION:
 *    - In createVideo(), when a new video is uploaded, we utilize 'notificationFactory'
 *      to dynamically instantiate EmailNotification and InAppNotification products.
 * 3. SECURITY & OWNERSHIP:
 *    - In updateVideo() & deleteVideo(), we verify that the user requesting the action
 *      is the authentic creator of the video before performing database changes.
 * ============================================================================
 */
@Service
public class VideoServiceImpl implements VideoService {

    private final VideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final VideoMapper videoMapper;
    private final VideoSortContext videoSortContext;
    private final NotificationFactory notificationFactory;

    public VideoServiceImpl(VideoRepository videoRepository,
                            CategoryRepository categoryRepository,
                            VideoMapper videoMapper,
                            VideoSortContext videoSortContext,
                            NotificationFactory notificationFactory) {
        this.videoRepository = videoRepository;
        this.categoryRepository = categoryRepository;
        this.videoMapper = videoMapper;
        this.videoSortContext = videoSortContext;
        this.notificationFactory = notificationFactory;
    }

    @Override
    @Transactional
    public VideoResponse createVideo(VideoCreateRequest request, User creator) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
        }

        Video video = new Video(
                request.getTitle(),
                request.getDescription(),
                request.getVideoUrl(),
                request.getThumbnailUrl() != null && !request.getThumbnailUrl().isBlank()
                        ? request.getThumbnailUrl()
                        : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
                request.getDurationSeconds() != null ? request.getDurationSeconds() : 0,
                request.getStatus() != null ? request.getStatus() : VideoStatus.PUBLISHED,
                request.getTags(),
                creator,
                category
        );

        Video savedVideo = videoRepository.save(video);

        // DESIGN PATTERN: Factory Pattern creates notification instances dynamically
        Notification emailNotification = notificationFactory.createNotification("EMAIL");
        emailNotification.send(creator.getEmail(), "Your video '" + savedVideo.getTitle() + "' has been published successfully!");

        Notification inAppNotification = notificationFactory.createNotification("IN_APP");
        inAppNotification.send(creator.getUsername(), "New video uploaded: " + savedVideo.getTitle());

        return videoMapper.toResponse(savedVideo);
    }

    @Override
    @Transactional
    public VideoResponse updateVideo(Long id, VideoUpdateRequest request, User user) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with ID: " + id));

        // Enforce ownership: only the creator can edit their video
        if (!video.getCreator().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this video.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            video.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            video.setDescription(request.getDescription());
        }
        if (request.getThumbnailUrl() != null) {
            video.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getDurationSeconds() != null) {
            video.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getStatus() != null) {
            video.setStatus(request.getStatus());
        }
        if (request.getTags() != null) {
            video.setTags(request.getTags());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            video.setCategory(category);
        }

        Video updatedVideo = videoRepository.save(video);
        return videoMapper.toResponse(updatedVideo);
    }

    @Override
    @Transactional
    public void deleteVideo(Long id, User user) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with ID: " + id));

        // Enforce ownership: only the creator can delete their video
        if (!video.getCreator().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this video.");
        }

        videoRepository.delete(video);
    }

    @Override
    @Transactional
    public VideoResponse getVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with ID: " + id));

        // Increment view count whenever a video is watched
        video.incrementViews();
        Video saved = videoRepository.save(video);
        return videoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VideoResponse likeVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with ID: " + id));

        video.incrementLikes();
        Video saved = videoRepository.save(video);
        return videoMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoResponse> getAllVideos(String query, Long categoryId, String sortStrategy) {
        // Query database with search query and optional category filter
        List<Video> videos = videoRepository.searchVideos(
                query != null && !query.isBlank() ? query.trim() : null,
                categoryId,
                VideoStatus.PUBLISHED
        );

        // DESIGN PATTERN: Apply Strategy Pattern to sort video results dynamically
        List<Video> sortedVideos = videoSortContext.executeSort(videos, sortStrategy);

        return sortedVideos.stream()
                .map(videoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoResponse> getCreatorVideos(User creator) {
        List<Video> videos = videoRepository.findByCreatorId(creator.getId());
        return videos.stream()
                .map(videoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CreatorDashboardSummaryDto getCreatorAnalytics(User creator) {
        Long creatorId = creator.getId();
        long totalVideos = videoRepository.countByCreatorId(creatorId);
        long totalViews = videoRepository.sumViewsByCreatorId(creatorId);
        long totalLikes = videoRepository.sumLikesByCreatorId(creatorId);

        // Engagement rate formula: (likes / views) * 100
        double overallEngagementRate = totalViews > 0
                ? Math.round(((double) totalLikes / totalViews * 100.0) * 10.0) / 10.0
                : 0.0;

        List<Video> topVideos = videoRepository.findTop5ByCreatorIdOrderByViewsCountDesc(creatorId);
        List<VideoResponse> topVideoResponses = topVideos.stream()
                .map(videoMapper::toResponse)
                .collect(Collectors.toList());

        return new CreatorDashboardSummaryDto(
                totalVideos,
                totalViews,
                totalLikes,
                overallEngagementRate,
                topVideoResponses
        );
    }
}
