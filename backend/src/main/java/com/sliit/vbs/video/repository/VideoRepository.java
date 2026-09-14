package com.sliit.vbs.video.repository;

import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.entity.VideoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByCreatorId(Long creatorId);

    List<Video> findByStatus(VideoStatus status);

    @Query("SELECT v FROM Video v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:categoryId IS NULL OR v.category.id = :categoryId) AND " +
           "(:query IS NULL OR LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           " OR LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           " OR LOWER(v.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Video> searchVideos(@Param("query") String query,
                             @Param("categoryId") Long categoryId,
                             @Param("status") VideoStatus status);

    @Query("SELECT COUNT(v) FROM Video v WHERE v.creator.id = :creatorId")
    long countByCreatorId(@Param("creatorId") Long creatorId);

    @Query("SELECT COALESCE(SUM(v.viewsCount), 0) FROM Video v WHERE v.creator.id = :creatorId")
    long sumViewsByCreatorId(@Param("creatorId") Long creatorId);

    @Query("SELECT COALESCE(SUM(v.likesCount), 0) FROM Video v WHERE v.creator.id = :creatorId")
    long sumLikesByCreatorId(@Param("creatorId") Long creatorId);

    List<Video> findTop5ByCreatorIdOrderByViewsCountDesc(Long creatorId);
}
