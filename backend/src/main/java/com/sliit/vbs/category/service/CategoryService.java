package com.sliit.vbs.category.service;

import com.sliit.vbs.category.dto.CategoryRequest;
import com.sliit.vbs.category.dto.CategoryResponse;
import com.sliit.vbs.category.dto.MergeCategoryRequest;

import java.util.List;

/**
 * Service interface for category management operations.
 *
 * @author IT25102597
 */
public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    CategoryResponse getCategoryBySlug(String slug);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getActiveCategories();

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    CategoryResponse renameCategory(Long id, String newName);

    CategoryResponse mergeCategories(MergeCategoryRequest request);

    CategoryResponse toggleActive(Long id);

    void deleteCategory(Long id);
}
