package com.sliit.vbs.support.repository;

import com.sliit.vbs.support.entity.SupportTicket;
import com.sliit.vbs.support.entity.TicketStatus;
import com.sliit.vbs.support.entity.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for support ticket persistence operations.
 *
 * @author IT25103483
 */
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserId(Long userId);

    List<SupportTicket> findByStatus(TicketStatus status);

    List<SupportTicket> findByPriority(TicketPriority priority);

    List<SupportTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status = :status")
    long countByStatus(TicketStatus status);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.priority = :priority AND t.status = 'OPEN'")
    long countOpenByPriority(TicketPriority priority);
}
