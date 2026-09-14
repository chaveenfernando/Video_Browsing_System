package com.sliit.vbs.favourite.entity;

import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.video.entity.Video;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity scaffold for Favourite Manager team member role.
 */
@Entity
@Table(name = "favourites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "video_id"})
})
public class Favourite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Favourite() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
