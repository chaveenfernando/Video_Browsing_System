package com.sliit.vbs.pattern.factory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Concrete Product: Email Notification.
 */
public class EmailNotification implements Notification {

    private static final Logger log = LoggerFactory.getLogger(EmailNotification.class);

    @Override
    public void send(String recipient, String message) {
        log.info("[EMAIL NOTIFICATION] Sending to: {} | Subject: VBS Alert | Body: {}", recipient, message);
    }

    @Override
    public String getChannelType() {
        return "EMAIL";
    }
}
