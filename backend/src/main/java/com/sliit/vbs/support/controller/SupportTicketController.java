package com.sliit.vbs.support.controller;

import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.support.dto.SupportTicketRequest;
import com.sliit.vbs.support.dto.SupportTicketResponse;
import com.sliit.vbs.support.dto.TicketStatusUpdateRequest;
import com.sliit.vbs.support.entity.TicketStatus;
import com.sliit.vbs.support.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for support ticket management.
 * Exposes endpoints for creating tickets, tracking status, and logging bugs.
 *
 * @author IT25103483
 */
@RestController
@RequestMapping("/api/v1/support")
@Tag(name = "Support Tickets", description = "Technical Supporter - Support Ticket Management APIs")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @PostMapping("/tickets")
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
            @Valid @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        SupportTicketResponse ticket = supportTicketService.createTicket(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticket, "Ticket created successfully"));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get a support ticket by ID")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getTicketById(id)));
    }

    @GetMapping("/tickets")
    @Operation(summary = "Get all support tickets (Technical Supporter only)")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getAllTickets()));
    }

    @GetMapping("/tickets/my")
    @Operation(summary = "Get the currently logged-in user's tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getMyTickets(userDetails.getUsername())));
    }

    @GetMapping("/tickets/status/{status}")
    @Operation(summary = "Get tickets filtered by status")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getByStatus(
            @PathVariable TicketStatus status) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getTicketsByStatus(status)));
    }

    @PatchMapping("/tickets/{id}/status")
    @Operation(summary = "Update the status of a ticket (triggers Observer notifications)")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.updateTicketStatus(id, request), "Ticket status updated"));
    }

    @PutMapping("/tickets/{id}")
    @Operation(summary = "Update a support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.updateTicket(id, request, userDetails.getUsername()), "Ticket updated"));
    }

    @DeleteMapping("/tickets/{id}")
    @Operation(summary = "Delete a support ticket")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        supportTicketService.deleteTicket(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket deleted successfully"));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get support dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getDashboardStats()));
    }
}
