package com.sliit.vbs.category.service.impl;

import com.sliit.vbs.category.dto.CategoryRequest;
import com.sliit.vbs.category.dto.CategoryResponse;
import com.sliit.vbs.category.dto.MergeCategoryRequest;
import com.sliit.vbs.category.entity.Category;
import com.sliit.vbs.category.repository.CategoryRepository;
import com.sliit.vbs.category.service.CategoryService;
import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CategoryService.
 * Handles CRUD, rename, merge, and active/inactive toggling of categories.
 *
 * @author IT25102597
 */
@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final VideoRepository videoRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               VideoRepository videoRepository) {
        this.categoryRepository = categoryRepository;
        this.videoRepository = videoRepository;
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("A category with name '" + request.getName() + "' already exists");
        }
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getColorHex() != null) category.setColorHex(request.getColorHex());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category c = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return toResponse(c);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByNameAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);
        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("A category named '" + request.getName() + "' already exists");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getColorHex() != null) category.setColorHex(request.getColorHex());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse renameCategory(Long id, String newName) {
        Category category = findById(id);
        if (categoryRepository.existsByNameAndIdNot(newName, id)) {
            throw new BadRequestException("A category named '" + newName + "' already exists");
        }
        category.setName(newName); // slug auto-updated in setter
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse mergeCategories(MergeCategoryRequest request) {
        if (request.getSourceCategoryId().equals(request.getTargetCategoryId())) {
            throw new BadRequestException("Source and target categories must be different");
        }
        Category source = findById(request.getSourceCategoryId());
        Category target = findById(request.getTargetCategoryId());

        // Re-assign all videos from source to target
        List<Video> sourceVideos = videoRepository.findByCategoryId(request.getSourceCategoryId());
        for (Video video : sourceVideos) {
            video.setCategory(target);
        }
        videoRepository.saveAll(sourceVideos);

        // Delete source category after migration
        categoryRepository.delete(source);

        return toResponse(categoryRepository.findById(target.getId()).orElse(target));
    }

    @Override
    public CategoryResponse toggleActive(Long id) {
        Category category = findById(id);
        category.setIsActive(!category.getIsActive());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = findById(id);
        long videoCount = videoRepository.countByCategoryId(id);
        if (videoCount > 0) {
            throw new BadRequestException(
                "Cannot delete category with " + videoCount + " video(s). Please merge or reassign them first.");
        }
        categoryRepository.delete(category);
    }

    // ---- Helpers ----

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private CategoryResponse toResponse(Category c) {
        CategoryResponse r = new CategoryResponse();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setSlug(c.getSlug());
        r.setDescription(c.getDescription());
        r.setIsActive(c.getIsActive());
        r.setColorHex(c.getColorHex());
        r.setVideoCount(c.getVideoCount());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
