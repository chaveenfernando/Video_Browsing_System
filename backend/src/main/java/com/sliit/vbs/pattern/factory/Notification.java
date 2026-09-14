package com.sliit.vbs.pattern.factory;

/**
 * ============================================================================
 * DESIGN PATTERN: FACTORY PATTERN (Creational)
 * ----------------------------------------------------------------------------
 * WHERE IS IT USED:
 * - In com.sliit.vbs.pattern.factory.NotificationFactory to produce different
 *   notification types (EmailNotification, InAppNotification) when significant
 *   events occur (e.g. video published, video status changed, support ticket updated).
 *
 * WHY IS IT USED:
 * - Problem: Creating notification objects directly with 'new' tightly couples
 *   business logic to specific notification implementations.
 * - Solution: The Factory Method encapsulates object instantiation logic,
 *   allowing new notification channels (e.g., SMS, Slack) to be added without
 *   altering business service code.
 * ============================================================================
 */
public interface Notification {
    void send(String recipient, String message);
    String getChannelType();
}
