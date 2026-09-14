package com.sliit.vbs.video;

import com.sliit.vbs.category.entity.Category;
import com.sliit.vbs.category.repository.CategoryRepository;
import com.sliit.vbs.pattern.factory.Notification;
import com.sliit.vbs.pattern.factory.NotificationFactory;
import com.sliit.vbs.pattern.strategy.SortByDateStrategy;
import com.sliit.vbs.pattern.strategy.SortByViewsStrategy;
import com.sliit.vbs.pattern.strategy.VideoSortContext;
import com.sliit.vbs.user.entity.Role;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.dto.VideoCreateRequest;
import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.entity.VideoStatus;
import com.sliit.vbs.video.mapper.VideoMapper;
import com.sliit.vbs.video.repository.VideoRepository;
import com.sliit.vbs.video.service.impl.VideoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * ============================================================================
 * VIVA TEST SUITE: VideoService & Strategy Pattern Verification
 * ============================================================================
 */
@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private NotificationFactory notificationFactory;

    @Mock
    private Notification mockNotification;

    private VideoMapper videoMapper;
    private VideoSortContext videoSortContext;
    private VideoServiceImpl videoService;

    private User testCreator;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        videoMapper = new VideoMapper();
        SortByDateStrategy dateStrategy = new SortByDateStrategy();
        SortByViewsStrategy viewsStrategy = new SortByViewsStrategy();
        videoSortContext = new VideoSortContext(List.of(dateStrategy, viewsStrategy), dateStrategy);

        videoService = new VideoServiceImpl(
                videoRepository,
                categoryRepository,
                videoMapper,
                videoSortContext,
                notificationFactory
        );

        testCreator = new User("creator", "creator@sliit.lk", "encodedPwd", "Chaveen Fernando", Role.ROLE_CONTENT_CREATOR, null);
        testCreator.setId(1L);

        testCategory = new Category(1L, "Software Engineering", "Tech topics");
    }

    @Test
    @DisplayName("Should create video and trigger Factory Pattern notification")
    void testCreateVideo_Success() {
        VideoCreateRequest request = new VideoCreateRequest(
                "Spring Boot Masterclass",
                "Learn Spring Boot 3",
                "https://example.com/video.mp4",
                "https://example.com/thumb.jpg",
                600,
                1L,
                "spring,java",
                VideoStatus.PUBLISHED
        );

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> {
            Video v = invocation.getArgument(0);
            v.setId(10L);
            return v;
        });
        when(notificationFactory.createNotification(anyString())).thenReturn(mockNotification);

        VideoResponse response = videoService.createVideo(request, testCreator);

        assertNotNull(response);
        assertEquals("Spring Boot Masterclass", response.getTitle());
        assertEquals(10L, response.getId());
        assertEquals("10:00", response.getFormattedDuration());

        // Verify Factory was invoked for both EMAIL and IN_APP notifications
        verify(notificationFactory, times(1)).createNotification("EMAIL");
        verify(notificationFactory, times(1)).createNotification("IN_APP");
        verify(mockNotification, times(2)).send(anyString(), anyString());
    }

    @Test
    @DisplayName("Should apply Strategy Pattern to sort videos by views")
    void testStrategyPattern_SortByViews() {
        Video video1 = new Video("Video A", "Desc", "url1", "thumb1", 100, VideoStatus.PUBLISHED, "tag", testCreator, testCategory);
        video1.setViewsCount(50L);

        Video video2 = new Video("Video B", "Desc", "url2", "thumb2", 100, VideoStatus.PUBLISHED, "tag", testCreator, testCategory);
        video2.setViewsCount(500L);

        when(videoRepository.searchVideos(isNull(), isNull(), eq(VideoStatus.PUBLISHED)))
                .thenReturn(List.of(video1, video2));

        List<VideoResponse> result = videoService.getAllVideos(null, null, "views");

        assertEquals(2, result.size());
        assertEquals("Video B", result.get(0).getTitle(), "Higher view count must come first");
        assertEquals("Video A", result.get(1).getTitle());
    }
}
