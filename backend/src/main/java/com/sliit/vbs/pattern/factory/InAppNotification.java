package com.sliit.vbs.pattern.factory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Concrete Product: In-App Dashboard Notification.
 */
public class InAppNotification implements Notification {

    private static final Logger log = LoggerFactory.getLogger(InAppNotification.class);

    @Override
    public void send(String recipient, String message) {
        log.info("[IN-APP NOTIFICATION] Storing notification for User: {} | Alert: {}", recipient, message);
    }

    @Override
    public String getChannelType() {
        return "IN_APP";
    }
}
