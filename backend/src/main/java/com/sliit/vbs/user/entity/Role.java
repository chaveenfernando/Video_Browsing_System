package com.sliit.vbs.user.entity;

/**
 * ============================================================================
 * Six Domain Roles for SE2030 Group Project (Group 2026-Y2-S1-MLB-B5G2-03)
 * 1. ROLE_CONTENT_CREATOR   -> Upload, edit, delete videos, view analytics (USER's role)
 * 2. ROLE_CATEGORY_MANAGER  -> Create, rename, merge, delete categories
 * 3. ROLE_PLAYLIST_MANAGER  -> Create playlist, add/remove/reorder videos, delete
 * 4. ROLE_FAVOURITE_MANAGER -> Add/remove favourite, view list, clear all
 * 5. ROLE_COMMENT_MANAGER   -> View, edit, hide, delete, pin comments
 * 6. ROLE_TECHNICAL_SUPPORTER -> Create/track support tickets, update status, log bugs
 * ============================================================================
 */
public enum Role {
    ROLE_CONTENT_CREATOR,
    ROLE_CATEGORY_MANAGER,
    ROLE_PLAYLIST_MANAGER,
    ROLE_FAVOURITE_MANAGER,
    ROLE_COMMENT_MANAGER,
    ROLE_TECHNICAL_SUPPORTER
}
