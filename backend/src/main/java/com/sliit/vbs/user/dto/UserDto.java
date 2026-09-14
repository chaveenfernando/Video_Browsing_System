package com.sliit.vbs.user.dto;

import com.sliit.vbs.user.entity.Role;
import com.sliit.vbs.user.entity.User;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private String avatarUrl;

    public UserDto() {
    }

    public UserDto(Long id, String username, String email, String fullName, Role role, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl()
        );
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
