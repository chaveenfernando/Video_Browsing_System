package com.sliit.vbs.playlist.repository;

import com.sliit.vbs.playlist.entity.PlaylistVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideo, Long> {
    List<PlaylistVideo> findByPlaylistIdOrderByDisplayOrderAsc(Long playlistId);
    
    Optional<PlaylistVideo> findByPlaylistIdAndVideoId(Long playlistId, Long videoId);
    
    boolean existsByPlaylistIdAndVideoId(Long playlistId, Long videoId);
    
    long countByPlaylistId(Long playlistId);

    void deleteByPlaylistId(Long playlistId);

    @Query("SELECT COALESCE(MAX(pv.displayOrder), 0) FROM PlaylistVideo pv WHERE pv.playlist.id = :playlistId")
    int findMaxDisplayOrderByPlaylistId(Long playlistId);
}
