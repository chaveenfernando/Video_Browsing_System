package com.sliit.vbs.notification.service;

import com.sliit.vbs.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse sendNotification(String recipientUsername,
                                          String recipientRole,
                                          String senderUsername,
                                          String senderName,
                                          String title,
                                          String message,
                                          String type,
                                          Long referenceId);

    List<NotificationResponse> getUserNotifications(String username, String role);

    long getUnreadCount(String username, String role);

    void markAsRead(Long id, String username);

    void markAllAsRead(String username, String role);
}
