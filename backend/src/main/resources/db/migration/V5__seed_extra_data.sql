-- Seed Comments for Comment Manager
INSERT IGNORE INTO comments (id, content, is_pinned, is_hidden, user_id, video_id, created_at, updated_at) VALUES
(1, 'This is an amazing tutorial on Spring Boot! Very helpful for our SE2030 project.', FALSE, FALSE, 2, 1, NOW(), NOW()),
(2, 'Could you do a video on React Server Components next?', TRUE, FALSE, 3, 2, NOW(), NOW()),
(3, 'Spam comment to be moderated by the comment manager! Visit my site http://spam.com', FALSE, TRUE, 4, 3, NOW(), NOW()),
(4, 'The factory pattern explanation was crystal clear. Thanks!', FALSE, FALSE, 1, 3, NOW(), NOW());

-- Seed Playlists for Playlist Manager
INSERT IGNORE INTO playlists (id, title, description, is_public, user_id, created_at, updated_at) VALUES
(1, 'SE2030 Final Project References', 'Helpful videos for our university project', TRUE, 3, NOW(), NOW()),
(2, 'My Watch Later', 'Videos to watch on the weekend', FALSE, 3, NOW(), NOW());

-- Link Videos to Playlists
INSERT IGNORE INTO playlist_videos (playlist_id, video_id) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 3);

-- Seed Favourites for Favourite Manager
INSERT IGNORE INTO favourites (id, user_id, video_id, created_at) VALUES
(1, 4, 1, NOW()),
(2, 4, 2, NOW()),
(3, 4, 3, NOW()),
(4, 2, 1, NOW());

-- Seed Support Tickets for Technical Supporter
INSERT IGNORE INTO support_tickets (id, subject, description, status, priority, user_id, created_at, updated_at) VALUES
(1, 'Cannot upload video thumbnail', 'Whenever I try to upload a PNG, it says format not supported.', 'OPEN', 'HIGH', 1, NOW(), NOW()),
(2, 'My playlist disappeared', 'I created a playlist yesterday but it is not showing up on my dashboard.', 'IN_PROGRESS', 'MEDIUM', 3, NOW(), NOW()),
(3, 'How to change password?', 'Is there an option to change my account password?', 'RESOLVED', 'LOW', 2, NOW(), NOW());
