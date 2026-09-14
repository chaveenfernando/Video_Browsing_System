-- ==========================================================
-- Web-Based Video Browsing System (VBS)
-- Group: 2026-Y2-S1-MLB-B5G2-03 | Module: SE2030
-- V2__seed_data.sql: Demo Seed Data for Viva & Testing
-- Password for all seed users: password123 (BCrypt hashed)
-- ==========================================================

-- Seed Accounts for all 6 team member roles
-- BCrypt hash for "password123": $2a$10$w1iQYqCqN8Yv3kX15IeH8e9q64Efxh82N6n9g2a5e4k4b2d1c0f8a
-- Standard BCrypt ($2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.)
INSERT INTO users (id, username, email, password, full_name, role, avatar_url) VALUES
(1, 'creator_user', 'creator@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Chaveen Fernando', 'ROLE_CONTENT_CREATOR', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'category_user', 'category@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Category Admin', 'ROLE_CATEGORY_MANAGER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'playlist_user', 'playlist@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Playlist Lead', 'ROLE_PLAYLIST_MANAGER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(4, 'favourite_user', 'favourite@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Favourite Curator', 'ROLE_FAVOURITE_MANAGER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(5, 'comment_user', 'comment@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Comment Moderator', 'ROLE_COMMENT_MANAGER', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
(6, 'support_user', 'support@sliit.lk', '$2a$10$eACCYoNO38qC46s0UCs03uZ2Z.g2Z/rQ7Zq82jT4bJtM1e1N4XpG.', 'Technical Supporter', 'ROLE_TECHNICAL_SUPPORTER', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150');

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Software Architecture', 'Design patterns, enterprise microservices, and system scalability concepts.'),
(2, 'Full Stack Web Dev', 'Modern web engineering with React, Spring Boot, TypeScript, and Tailwind.'),
(3, 'Cloud & DevOps', 'Docker, Kubernetes, CI/CD pipelines, and cloud native deployments.'),
(4, 'Database Engineering', 'MySQL optimization, indexing, ACID transactions, and Flyway versioning.');

-- Seed Initial Videos for Content Creator (creator_id = 1)
INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration_seconds, views_count, likes_count, status, tags, creator_id, category_id, created_at) VALUES
(1, 'Spring Boot 3 Deep Dive: Building Enterprise REST APIs', 'Comprehensive masterclass on Spring Boot 3, Spring Data JPA, and JWT security for enterprise applications.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', 840, 1420, 195, 'PUBLISHED', 'springboot,java,backend', 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Mastering React 18 & TypeScript: Production Architecture', 'Learn how to organize large-scale Vite + React applications with clean feature-sliced modules.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600', 1230, 2890, 412, 'PUBLISHED', 'react,typescript,frontend', 1, 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'Design Patterns in Practice: Strategy & Factory Patterns', 'Viva-ready architectural guide demonstrating Strategy and Factory design patterns in real-world Java.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1516116211227-bbc13c734187?w=600', 650, 950, 145, 'PUBLISHED', 'designpatterns,java,viva', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'Dockerizing Full Stack Apps with MySQL & Spring Boot', 'Step-by-step containerization walkthrough for university software engineering submissions.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600', 915, 340, 56, 'PUBLISHED', 'docker,devops,mysql', 1, 3, NOW());
