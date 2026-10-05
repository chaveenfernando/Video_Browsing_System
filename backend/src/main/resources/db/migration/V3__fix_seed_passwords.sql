-- ==========================================================
-- Web-Based Video Browsing System (VBS)
-- V3__fix_seed_passwords.sql
-- Re-sets all seed user passwords to a verified BCrypt hash.
-- Plain password for all accounts: password123
-- Hash generated at runtime by BCryptPasswordEncoder(10).
-- ==========================================================

-- This hash is a valid BCrypt(10) hash for "password123"
-- Generated and verified by Spring Boot BCryptPasswordEncoder
UPDATE users SET password = '$2a$10$shvLJnl1nvKk4lr.zeNexuke6XRlqDJ5rieKPJO2dvFrE.d0MbSKq'
WHERE id IN (1, 2, 3, 4, 5, 6);
