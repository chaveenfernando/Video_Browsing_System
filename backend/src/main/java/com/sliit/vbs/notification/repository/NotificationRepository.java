package com.sliit.vbs.notification.repository;

import com.sliit.vbs.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT n FROM NotificationEntity n WHERE n.recipientUsername = :username OR n.recipientRole = :role ORDER BY n.createdAt DESC")
    List<NotificationEntity> findUserNotifications(@Param("username") String username, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE (n.recipientUsername = :username OR n.recipientRole = :role) AND n.isRead = false")
    long countUnread(@Param("username") String username, @Param("role") String role);

    List<NotificationEntity> findByRecipientRoleOrderByCreatedAtDesc(String role);
}
