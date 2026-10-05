package com.sliit.vbs.notification.controller;

import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.notification.dto.NotificationResponse;
import com.sliit.vbs.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Cross-role stakeholder in-app notification center")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String getPrimaryRole(UserDetails userDetails) {
        if (userDetails == null || userDetails.getAuthorities().isEmpty()) {
            return "";
        }
        return userDetails.getAuthorities().iterator().next().getAuthority();
    }

    @GetMapping
    @Operation(summary = "Get user and role-specific notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        String role = getPrimaryRole(userDetails);
        List<NotificationResponse> list = notificationService.getUserNotifications(userDetails.getUsername(), role);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        String role = getPrimaryRole(userDetails);
        long count = notificationService.getUnreadCount(userDetails.getUsername(), role);
        return ResponseEntity.ok(ApiResponse.success(Collections.singletonMap("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        String role = getPrimaryRole(userDetails);
        notificationService.markAllAsRead(userDetails.getUsername(), role);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}
