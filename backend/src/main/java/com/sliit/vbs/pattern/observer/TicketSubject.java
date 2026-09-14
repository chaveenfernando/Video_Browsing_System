package com.sliit.vbs.pattern.observer;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================================
 * VIVA EXPLANATION: TicketSubject (Observer Pattern Subject)
 * ----------------------------------------------------------------------------
 * Maintains a registry of TicketStatusObserver listeners and triggers their
 * callback whenever notifyObservers() is executed.
 * ============================================================================
 */
@Component
public class TicketSubject {

    private final List<TicketStatusObserver> observers = new ArrayList<>();

    public void attach(TicketStatusObserver observer) {
        observers.add(observer);
    }

    public void detach(TicketStatusObserver observer) {
        observers.remove(observer);
    }

    public void notifyObservers(Long ticketId, String oldStatus, String newStatus, String recipientEmail) {
        for (TicketStatusObserver observer : observers) {
            observer.onStatusChanged(ticketId, oldStatus, newStatus, recipientEmail);
        }
    }
}
