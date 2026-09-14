package com.sliit.vbs.playlist.repository;

import com.sliit.vbs.playlist.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Playlist> findByIsPublicTrueOrderByCreatedAtDesc();
}
