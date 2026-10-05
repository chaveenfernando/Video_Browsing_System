package com.sliit.vbs.comment.repository;

import com.sliit.vbs.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for comment persistence and query operations.
 *
 * @author IT25101638
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // All visible comments for a video, pinned ones first
    @Query("SELECT c FROM Comment c WHERE c.video.id = :videoId AND c.isHidden = false ORDER BY c.isPinned DESC, c.createdAt DESC")
    List<Comment> findVisibleByVideoId(@Param("videoId") Long videoId);

    // All comments across the platform (platform-wide comment manager view)
    List<Comment> findAllByOrderByCreatedAtDesc();

    // All comments for a video (admin/manager view)
    List<Comment> findByVideoIdOrderByIsPinnedDescCreatedAtDesc(Long videoId);

    // All comments by a specific user
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Pinned comments for a video
    List<Comment> findByVideoIdAndIsPinnedTrueOrderByCreatedAtDesc(Long videoId);

    // Count by video
    long countByVideoId(Long videoId);

    // Count visible (not hidden) by video
    long countByVideoIdAndIsHiddenFalse(Long videoId);

    @Modifying
    @Query("UPDATE Comment c SET c.likeCount = c.likeCount + 1 WHERE c.id = :id")
    void incrementLike(@Param("id") Long id);
}
