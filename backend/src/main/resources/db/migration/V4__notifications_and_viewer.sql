-- ==========================================================
-- Web-Based Video Browsing System (VBS)
-- Group: 2026-Y2-S1-MLB-B5G2-03 | Module: SE2030
-- V4__notifications_and_viewer.sql: Notifications & General Viewer Seed
-- ==========================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_username VARCHAR(50),
    recipient_role VARCHAR(40),
    sender_username VARCHAR(50),
    sender_name VARCHAR(100),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SEED GENERAL VIEWER ACCOUNT (ID = 7)
-- BCrypt(10) hash for "password123": $2a$10$shvLJnl1nvKk4lr.zeNexuke6XRlqDJ5rieKPJO2dvFrE.d0MbSKq
INSERT INTO users (id, username, email, password, full_name, role, avatar_url) VALUES
(7, 'viewer_user', 'viewer@sliit.lk', '$2a$10$shvLJnl1nvKk4lr.zeNexuke6XRlqDJ5rieKPJO2dvFrE.d0MbSKq', 'Samitha Viewer', 'ROLE_GENERAL_VIEWER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

-- 3. SEED INITIAL NOTIFICATIONS FOR STAKEHOLDERS
INSERT INTO notifications (recipient_role, sender_username, sender_name, title, message, type, reference_id, is_read, created_at) VALUES
('ROLE_FAVOURITE_MANAGER', 'viewer_user', 'Samitha Viewer', 'New Video Favourited', 'Viewer Samitha Viewer added "Spring Boot 3 Deep Dive" to their favourites.', 'FAVOURITE', 1, FALSE, NOW()),
('ROLE_COMMENT_MANAGER', 'viewer_user', 'Samitha Viewer', 'New Comment Posted', 'Samitha Viewer commented on "Mastering React 18": "This tutorial made Redux and hooks super easy to understand!"', 'COMMENT', 2, FALSE, NOW()),
('ROLE_TECHNICAL_SUPPORTER', 'viewer_user', 'Samitha Viewer', 'New Support Ticket', 'Samitha Viewer logged a ticket: "Video playback buffering at 1080p"', 'SUPPORT', 1, FALSE, NOW());

INSERT INTO notifications (recipient_username, sender_username, sender_name, title, message, type, reference_id, is_read, created_at) VALUES
('creator_user', 'viewer_user', 'Samitha Viewer', 'New Video Like', 'Samitha Viewer liked your video "Spring Boot 3 Deep Dive".', 'LIKE', 1, FALSE, NOW()),
('creator_user', 'viewer_user', 'Samitha Viewer', 'New Video Favourite', 'Samitha Viewer saved your video "Mastering React 18" to favourites.', 'FAVOURITE', 2, FALSE, NOW());
