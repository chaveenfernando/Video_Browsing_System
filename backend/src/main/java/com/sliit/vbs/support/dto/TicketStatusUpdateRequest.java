package com.sliit.vbs.support.dto;

import com.sliit.vbs.support.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating a ticket's status.
 *
 * @author IT25103483
 */
public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
