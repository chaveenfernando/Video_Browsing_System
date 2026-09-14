package com.sliit.vbs.pattern.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Concrete Observer: Sends an email when ticket status changes.
 */
@Component
public class EmailTicketObserver implements TicketStatusObserver {

    private static final Logger log = LoggerFactory.getLogger(EmailTicketObserver.class);

    @Override
    public void onStatusChanged(Long ticketId, String oldStatus, String newStatus, String recipientEmail) {
        log.info("[OBSERVER - EMAIL] Ticket #{}: Status changed from {} to {}. Alert email sent to: {}",
                ticketId, oldStatus, newStatus, recipientEmail);
    }
}
