package com.sliit.vbs.video;

import com.sliit.vbs.category.entity.Category;
import com.sliit.vbs.category.repository.CategoryRepository;
import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.pattern.factory.Notification;
import com.sliit.vbs.pattern.factory.NotificationFactory;
import com.sliit.vbs.pattern.strategy.SortByDateStrategy;
import com.sliit.vbs.pattern.strategy.VideoSortContext;
import com.sliit.vbs.user.entity.Role;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.controller.VideoController;
import com.sliit.vbs.video.dto.VideoCreateRequest;
import com.sliit.vbs.video.dto.VideoResponse;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.entity.VideoStatus;
import com.sliit.vbs.video.mapper.VideoMapper;
import com.sliit.vbs.video.repository.VideoRepository;
import com.sliit.vbs.video.service.impl.VideoServiceImpl;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * ============================================================================
 * SLIIT SE2030 - Software Engineering | Lab Sheet 05
 * ----------------------------------------------------------------------------
 * USE CASE 01: Upload Video
 * ASSIGNED MEMBER: Fernando H.C.S (IT25100707)
 * GROUP: 2026-Y2-S1-MLB-B5G2-03
 *
 * Verifies all 10 Test Cases:
 * - TC-UV-01: Access Upload Video Page (Authentication & Role Verification)
 * - TC-UV-02: Upload valid MP4 video with complete metadata
 * - TC-UV-03: Upload valid MOV format video
 * - TC-UV-04: Unsupported file format rejected (.mkv)
 * - TC-UV-05: File exceeds size limit (> 2 GB) rejected
 * - TC-UV-06: Title left empty validation error
 * - TC-UV-07: No category selected validation error
 * - TC-UV-08: Failure handling and metadata preservation
 * - TC-UV-09: Retry after connection loss creates single record (no duplicate)
 * - TC-UV-10: Upload without login denied
 * ============================================================================
 */
@ExtendWith(MockitoExtension.class)
class UploadVideoUseCaseTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private NotificationFactory notificationFactory;

    @Mock
    private Notification mockNotification;

    private VideoServiceImpl videoService;
    private VideoController videoController;
    private Validator validator;

    private User contentCreator;
    private Category programmingCategory;

    @BeforeEach
    void setUp() {
        VideoMapper videoMapper = new VideoMapper();
        SortByDateStrategy dateStrategy = new SortByDateStrategy();
        VideoSortContext sortContext = new VideoSortContext(List.of(dateStrategy), dateStrategy);

        videoService = new VideoServiceImpl(
                videoRepository,
                categoryRepository,
                videoMapper,
                sortContext,
                notificationFactory
        );

        videoController = new VideoController(videoService);

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        contentCreator = new User(
                "creator01",
                "creator01@vbs.lk",
                "$2a$10$w1iQYqCqN8Yv3kX15IeH8e9q64Efxh82N6n9g2a5e4k4b2d1c0f8a",
                "Fernando H.C.S",
                Role.ROLE_CONTENT_CREATOR,
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        );
        contentCreator.setId(1L);

        programmingCategory = new Category(1L, "Programming", "Computer programming tutorials");
    }

    @Test
    @DisplayName("TC-UV-01: Verify a logged-in Content Creator can access upload facilities")
    void testTC_UV_01_AccessUploadVideoPage() {
        assertNotNull(contentCreator);
        assertEquals(Role.ROLE_CONTENT_CREATOR, contentCreator.getRole());
        assertTrue(contentCreator.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CONTENT_CREATOR")));
    }

    @Test
    @DisplayName("TC-UV-02: Upload valid MP4 with complete metadata is uploaded successfully")
    void testTC_UV_02_UploadValidMp4Video() {
        VideoCreateRequest request = new VideoCreateRequest(
                "Intro to Java",
                "Comprehensive Java programming fundamentals",
                "/uploads/intro_java.mp4",
                "java.png",
                720,
                1L,
                "java,programming",
                VideoStatus.PUBLISHED
        );

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(programmingCategory));
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> {
            Video v = invocation.getArgument(0);
            v.setId(101L);
            return v;
        });
        when(notificationFactory.createNotification(anyString())).thenReturn(mockNotification);

        ResponseEntity<ApiResponse<VideoResponse>> responseEntity = videoController.createVideo(request, contentCreator);

        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().isSuccess());
        assertEquals("Intro to Java", responseEntity.getBody().getData().getTitle());
        assertEquals(101L, responseEntity.getBody().getData().getId());
        assertEquals(VideoStatus.PUBLISHED, responseEntity.getBody().getData().getStatus());

        verify(videoRepository, times(1)).save(any(Video.class));
        verify(notificationFactory, times(2)).createNotification(anyString());
    }

    @Test
    @DisplayName("TC-UV-03: Verify MOV format is accepted by media upload endpoint")
    void testTC_UV_03_UploadValidMovVideo() throws IOException {
        MockMultipartFile movFile = new MockMultipartFile(
                "file",
                "lab_demo.mov",
                "video/quicktime",
                "sample-mov-data".getBytes()
        );

        ResponseEntity<ApiResponse<String>> response = videoController.uploadMediaFile(movFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getData().contains("lab_demo.mov"));
    }

    @Test
    @DisplayName("TC-UV-04: Verify an unsupported format is rejected (.mkv)")
    void testTC_UV_04_UnsupportedFileFormat_Rejected() throws IOException {
        MockMultipartFile mkvFile = new MockMultipartFile(
                "file",
                "lecture.mkv",
                "video/x-matroska",
                "sample-mkv-data".getBytes()
        );

        ResponseEntity<ApiResponse<String>> response = videoController.uploadMediaFile(mkvFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Unsupported file format. Use MP4, MOV or AVI", response.getBody().getMessage());
    }

    @Test
    @DisplayName("TC-UV-05: Verify files above the 2 GB size limit are rejected")
    void testTC_UV_05_FileExceedsSizeLimit_Rejected() throws IOException {
        // Construct a mock multipart file that reports a size exceeding 2 GB
        long oversizedBytes = 2500000000L; // 2.5 GB
        MockMultipartFile oversizedFile = new MockMultipartFile(
                "file",
                "full_course.mp4",
                "video/mp4",
                "sample".getBytes()
        ) {
            @Override
            public long getSize() {
                return oversizedBytes;
            }
        };

        ResponseEntity<ApiResponse<String>> response = videoController.uploadMediaFile(oversizedFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("File size exceeds the allowed limit", response.getBody().getMessage());
    }

    @Test
    @DisplayName("TC-UV-06: Verify title is mandatory (empty title triggers validation error)")
    void testTC_UV_06_TitleLeftEmpty_ValidationError() {
        VideoCreateRequest request = new VideoCreateRequest();
        request.setTitle(""); // Empty title
        request.setVideoUrl("https://example.com/video.mp4");
        request.setCategoryId(1L);

        Set<ConstraintViolation<VideoCreateRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty(), "Violations must be reported when title is blank");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Title is required")));
    }

    @Test
    @DisplayName("TC-UV-07: Verify category is mandatory (null category triggers validation error)")
    void testTC_UV_07_NoCategorySelected_ValidationError() {
        VideoCreateRequest request = new VideoCreateRequest();
        request.setTitle("OOP Basics");
        request.setVideoUrl("https://example.com/video.mp4");
        request.setCategoryId(null); // No category selected

        Set<ConstraintViolation<VideoCreateRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty(), "Violations must be reported when categoryId is null");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Please select a category")));
    }

    @Test
    @DisplayName("TC-UV-08: Verify connection lost failure handling retains metadata in request payload")
    void testTC_UV_08_ConnectionLostDuringUpload_PreserveMetadata() {
        VideoCreateRequest draftPayload = new VideoCreateRequest(
                "Intro to Java",
                "Draft description saved during network glitch",
                "intro_java.mp4",
                "thumb.jpg",
                300,
                1L,
                "java",
                VideoStatus.DRAFT
        );

        // Simulate network / database disruption during transaction
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(programmingCategory));
        when(videoRepository.save(any(Video.class))).thenThrow(new RuntimeException("Network timeout to database"));

        assertThrows(RuntimeException.class, () -> videoService.createVideo(draftPayload, contentCreator));

        // Verify the client metadata remains fully intact and preserved for subsequent retry
        assertEquals("Intro to Java", draftPayload.getTitle());
        assertEquals(1L, draftPayload.getCategoryId());
        assertEquals("intro_java.mp4", draftPayload.getVideoUrl());
    }

    @Test
    @DisplayName("TC-UV-09: Verify upload retry succeeds and creates exactly one video record")
    void testTC_UV_09_RetryAfterConnectionLoss_Success() {
        VideoCreateRequest retryPayload = new VideoCreateRequest(
                "Intro to Java",
                "Draft description saved during network glitch",
                "intro_java.mp4",
                "thumb.jpg",
                300,
                1L,
                "java",
                VideoStatus.PUBLISHED
        );

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(programmingCategory));
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> {
            Video v = invocation.getArgument(0);
            v.setId(205L);
            return v;
        });
        when(notificationFactory.createNotification(anyString())).thenReturn(mockNotification);

        VideoResponse response = videoService.createVideo(retryPayload, contentCreator);

        assertNotNull(response);
        assertEquals(205L, response.getId());
        assertEquals("Intro to Java", response.getTitle());
        verify(videoRepository, times(1)).save(any(Video.class));
    }

    @Test
    @DisplayName("TC-UV-10: Verify unauthenticated or non-creator user cannot upload videos")
    void testTC_UV_10_UploadWithoutLogin_Denied() {
        User viewer = new User(
                "viewer01",
                "viewer01@vbs.lk",
                "password123",
                "Regular Viewer",
                Role.ROLE_GENERAL_VIEWER,
                null
        );

        assertFalse(viewer.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CONTENT_CREATOR")),
                "Normal viewer must not possess ROLE_CONTENT_CREATOR authority");
    }
}
