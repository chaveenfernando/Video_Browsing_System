package com.sliit.vbs.category.repository;

import com.sliit.vbs.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for category persistence operations.
 *
 * @author IT25102597
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Optional<Category> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<Category> findByIsActiveTrueOrderByNameAsc();

    List<Category> findAllByOrderByNameAsc();

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.videos WHERE c.id = :id")
    Optional<Category> findByIdWithVideos(Long id);

    @Query("SELECT c FROM Category c ORDER BY SIZE(c.videos) DESC")
    List<Category> findAllOrderByVideoCountDesc();
}
