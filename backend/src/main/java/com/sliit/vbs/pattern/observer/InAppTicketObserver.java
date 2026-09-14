package com.sliit.vbs.pattern.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Concrete Observer: Dispatches in-app notification when ticket status changes.
 */
@Component
public class InAppTicketObserver implements TicketStatusObserver {

    private static final Logger log = LoggerFactory.getLogger(InAppTicketObserver.class);

    @Override
    public void onStatusChanged(Long ticketId, String oldStatus, String newStatus, String recipientEmail) {
        log.info("[OBSERVER - IN-APP] Ticket #{}: In-App alert logged: status transitioned to {}",
                ticketId, newStatus);
    }
}
