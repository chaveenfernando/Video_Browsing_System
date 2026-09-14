package com.sliit.vbs.playlist.entity;

import com.sliit.vbs.video.entity.Video;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_videos")
public class PlaylistVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt = LocalDateTime.now();

    public PlaylistVideo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Playlist getPlaylist() { return playlist; }
    public void setPlaylist(Playlist playlist) { this.playlist = playlist; }
    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public LocalDateTime getAddedAt() { return addedAt; }
}
