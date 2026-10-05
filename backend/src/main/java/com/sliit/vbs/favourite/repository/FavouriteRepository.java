package com.sliit.vbs.favourite.repository;

import com.sliit.vbs.favourite.entity.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Favourite Manager operations.
 *
 * @author IT25103653
 */
@Repository
public interface FavouriteRepository extends JpaRepository<Favourite, Long> {

    List<Favourite> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Favourite> findAllByOrderByCreatedAtDesc();

    List<Favourite> findByVideoId(Long videoId);

    Optional<Favourite> findByUserIdAndVideoId(Long userId, Long videoId);

    boolean existsByUserIdAndVideoId(Long userId, Long videoId);

    long countByUserId(Long userId);

    long countByVideoId(Long videoId);

    void deleteByUserIdAndVideoId(Long userId, Long videoId);
}
