package com.sliit.vbs.notification.service.impl;

import com.sliit.vbs.notification.dto.NotificationResponse;
import com.sliit.vbs.notification.entity.NotificationEntity;
import com.sliit.vbs.notification.repository.NotificationRepository;
import com.sliit.vbs.notification.service.NotificationService;
import com.sliit.vbs.pattern.factory.Notification;
import com.sliit.vbs.pattern.factory.NotificationFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.event.EventListener;
import com.sliit.vbs.video.event.VideoUploadedEvent;

/**
 * ============================================================================
 * VIVA EXPLANATION: NotificationServiceImpl
 * ----------------------------------------------------------------------------
 * Handles multi-stakeholder alerts triggered by user actions (like, favourite,
 * comment, support, playlist).
 * Integrates with NotificationFactory (Design Pattern) to decouple the creation
 * of notification channels while maintaining persistent alerts in DB.
 * 
 * DESIGN PATTERN (OBSERVER):
 * This service acts as an OBSERVER listening for VideoUploadedEvent. When a video
 * is uploaded, it automatically generates a platform-wide notification without 
 * coupling the video upload logic directly to the notification logic.
 * ============================================================================
 */
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationFactory notificationFactory;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   NotificationFactory notificationFactory) {
        this.notificationRepository = notificationRepository;
        this.notificationFactory = notificationFactory;
    }

    // OBSERVER PATTERN: Listening to the event
    @EventListener
    public void handleVideoUploadedEvent(VideoUploadedEvent event) {
        System.out.println("OBSERVER TRIGGERED: New Video Uploaded - " + event.getVideoTitle());
        
        // Notify subscribers (or in this case, broadcast a system alert for the new video)
        sendNotification(
                "SYSTEM_BROADCAST",
                "ROLE_GENERAL_VIEWER",
                event.getUploaderName(),
                event.getUploaderName(),
                "New Video from " + event.getUploaderName(),
                "Check out the new video: " + event.getVideoTitle(),
                "NEW_VIDEO_ALERT",
                event.getVideoId()
        );
    }

    @Override
    public NotificationResponse sendNotification(String recipientUsername,
                                                 String recipientRole,
                                                 String senderUsername,
                                                 String senderName,
                                                 String title,
                                                 String message,
                                                 String type,
                                                 Long referenceId) {
        // 1. Persist notification to database
        NotificationEntity entity = new NotificationEntity();
        entity.setRecipientUsername(recipientUsername);
        entity.setRecipientRole(recipientRole);
        entity.setSenderUsername(senderUsername);
        entity.setSenderName(senderName);
        entity.setTitle(title);
        entity.setMessage(message);
        entity.setType(type);
        entity.setReferenceId(referenceId);
        entity.setRead(false);

        NotificationEntity saved = notificationRepository.save(entity);

        // 2. DESIGN PATTERN: Dispatch via NotificationFactory
        try {
            Notification inApp = notificationFactory.createNotification("IN_APP");
            String target = recipientUsername != null ? recipientUsername : recipientRole;
            inApp.send(target, "[" + type + "] " + title + ": " + message);
        } catch (Exception ignored) {
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String username, String role) {
        return notificationRepository.findUserNotifications(username, role)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String username, String role) {
        return notificationRepository.countUnread(username, role);
    }

    @Override
    public void markAsRead(Long id, String username) {
        notificationRepository.findById(id).ifPresent(entity -> {
            entity.setRead(true);
            notificationRepository.save(entity);
        });
    }

    @Override
    public void markAllAsRead(String username, String role) {
        List<NotificationEntity> notifications = notificationRepository.findUserNotifications(username, role);
        for (NotificationEntity n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse toResponse(NotificationEntity entity) {
        NotificationResponse res = new NotificationResponse();
        res.setId(entity.getId());
        res.setRecipientUsername(entity.getRecipientUsername());
        res.setRecipientRole(entity.getRecipientRole());
        res.setSenderUsername(entity.getSenderUsername());
        res.setSenderName(entity.getSenderName());
        res.setTitle(entity.getTitle());
        res.setMessage(entity.getMessage());
        res.setType(entity.getType());
        res.setReferenceId(entity.getReferenceId());
        res.setRead(entity.isRead());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }
}
