package com.sliit.vbs.support.service.impl;

import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.pattern.observer.TicketSubject;
import com.sliit.vbs.support.dto.SupportTicketRequest;
import com.sliit.vbs.support.dto.SupportTicketResponse;
import com.sliit.vbs.support.dto.TicketStatusUpdateRequest;
import com.sliit.vbs.support.entity.SupportTicket;
import com.sliit.vbs.support.entity.TicketStatus;
import com.sliit.vbs.support.repository.SupportTicketRepository;
import com.sliit.vbs.support.service.SupportTicketService;
import com.sliit.vbs.user.entity.Role;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of SupportTicketService.
 * Uses the Observer Design Pattern to notify users when a ticket status changes.
 *
 * @author IT25103483
 */
@Service
@Transactional
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketSubject ticketSubject;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.sliit.vbs.notification.service.NotificationService notificationService;

    public SupportTicketServiceImpl(SupportTicketRepository ticketRepository,
                                    UserRepository userRepository,
                                    TicketSubject ticketSubject) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketSubject = ticketSubject;
    }

    @Override
    public SupportTicketResponse createTicket(SupportTicketRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCategory(request.getCategory());
        ticket.setUser(user);

        SupportTicket saved = ticketRepository.save(ticket);

        // STAKEHOLDER NOTIFICATION: Alert Technical Supporter
        try {
            if (notificationService != null) {
                notificationService.sendNotification(
                        null,
                        "ROLE_TECHNICAL_SUPPORTER",
                        user.getUsername(),
                        user.getFullName(),
                        "New Support Ticket #" + saved.getId(),
                        user.getFullName() + " filed ticket: \"" + saved.getSubject() + "\" [" + saved.getPriority() + "]",
                        "SUPPORT",
                        saved.getId()
                );
            }
        } catch (Exception ignored) {
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketById(Long id) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMyTickets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return ticketRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public SupportTicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        SupportTicket updated = ticketRepository.save(ticket);

        // Notify observers (Observer Design Pattern)
        ticketSubject.notifyObservers(updated.getId(), oldStatus.name(), request.getStatus().name());

        return toResponse(updated);
    }

    @Override
    public SupportTicketResponse updateTicket(Long id, SupportTicketRequest request, String username) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Only the ticket owner or a TECHNICAL_SUPPORTER can edit
        boolean isOwner = ticket.getUser().getId().equals(user.getId());
        boolean isTechnicalSupporter = user.getRole() == Role.ROLE_TECHNICAL_SUPPORTER;
        if (!isOwner && !isTechnicalSupporter) {
            throw new BadRequestException("You do not have permission to edit this ticket");
        }

        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCategory(request.getCategory());

        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public void deleteTicket(Long id, String username) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean isOwner = ticket.getUser().getId().equals(user.getId());
        boolean isTechnicalSupporter = user.getRole() == Role.ROLE_TECHNICAL_SUPPORTER;
        if (!isOwner && !isTechnicalSupporter) {
            throw new BadRequestException("You do not have permission to delete this ticket");
        }

        ticketRepository.delete(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", ticketRepository.count());
        stats.put("open", ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.put("inProgress", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.put("resolved", ticketRepository.countByStatus(TicketStatus.RESOLVED));
        stats.put("closed", ticketRepository.countByStatus(TicketStatus.CLOSED));
        return stats;
    }

    private SupportTicketResponse toResponse(SupportTicket ticket) {
        SupportTicketResponse response = new SupportTicketResponse();
        response.setId(ticket.getId());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setPriority(ticket.getPriority());
        response.setCategory(ticket.getCategory());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());

        if (ticket.getUser() != null) {
            response.setUserId(ticket.getUser().getId());
            response.setUserName(ticket.getUser().getUsername());
        }
        if (ticket.getAssignedTo() != null) {
            response.setAssignedToId(ticket.getAssignedTo().getId());
            response.setAssignedToName(ticket.getAssignedTo().getUsername());
        }
        return response;
    }
}
