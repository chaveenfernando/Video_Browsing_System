package com.sliit.vbs.support.service;

import com.sliit.vbs.support.dto.SupportTicketRequest;
import com.sliit.vbs.support.dto.SupportTicketResponse;
import com.sliit.vbs.support.dto.TicketStatusUpdateRequest;
import com.sliit.vbs.support.entity.TicketStatus;

import java.util.List;
import java.util.Map;

/**
 * Service interface for support ticket operations.
 *
 * @author IT25103483
 */
public interface SupportTicketService {

    SupportTicketResponse createTicket(SupportTicketRequest request, String username);

    SupportTicketResponse getTicketById(Long id);

    List<SupportTicketResponse> getAllTickets();

    List<SupportTicketResponse> getMyTickets(String username);

    List<SupportTicketResponse> getTicketsByStatus(TicketStatus status);

    SupportTicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request);

    SupportTicketResponse updateTicket(Long id, SupportTicketRequest request, String username);

    void deleteTicket(Long id, String username);

    Map<String, Long> getDashboardStats();
}
