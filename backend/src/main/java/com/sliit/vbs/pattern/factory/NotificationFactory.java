package com.sliit.vbs.pattern.factory;

import org.springframework.stereotype.Component;

/**
 * ============================================================================
 * VIVA EXPLANATION: NotificationFactory
 * ----------------------------------------------------------------------------
 * Factory class responsible for instantiating the appropriate Notification product.
 * Client code simply calls:
 *   notificationFactory.createNotification("EMAIL") or ("IN_APP")
 * without knowing or coupling to the concrete constructors.
 * ============================================================================
 */
@Component
public class NotificationFactory {

    public Notification createNotification(String channelType) {
        if (channelType == null) {
            throw new IllegalArgumentException("Channel type cannot be null");
        }

        return switch (channelType.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "IN_APP", "INAPP" -> new InAppNotification();
            default -> throw new IllegalArgumentException("Unknown notification channel: " + channelType);
        };
    }
}
