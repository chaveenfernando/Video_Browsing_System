package com.sliit.vbs.pattern.observer;

/**
 * ============================================================================
 * DESIGN PATTERN: OBSERVER PATTERN (Behavioral)
 * ----------------------------------------------------------------------------
 * WHERE IS IT USED:
 * - Used in com.sliit.vbs.pattern.observer.TicketSubject to notify interested
 *   parties when a technical support ticket's status changes (e.g., OPEN -> RESOLVED).
 *
 * WHY IS IT USED:
 * - Problem: When an entity state changes, multiple dependent services
 *   (audit loggers, email notifiers, dashboard pushers) need to react without
 *   tightly coupling the entity to those individual services.
 * - Solution: Subject maintains a list of observers and notifies them automatically
 *   via broadcast when its state changes (One-to-Many dependency).
 * ============================================================================
 */
public interface TicketStatusObserver {
    void onStatusChanged(Long ticketId, String oldStatus, String newStatus, String recipientEmail);
}
