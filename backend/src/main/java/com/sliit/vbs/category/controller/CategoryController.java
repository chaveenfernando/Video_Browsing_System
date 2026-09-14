package com.sliit.vbs.category.controller;

import com.sliit.vbs.category.dto.CategoryRequest;
import com.sliit.vbs.category.dto.CategoryResponse;
import com.sliit.vbs.category.dto.MergeCategoryRequest;
import com.sliit.vbs.category.service.CategoryService;
import com.sliit.vbs.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing video categories.
 * Provides endpoints to create, rename, merge and delete categories.
 *
 * @author IT25102597
 */
@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Category Manager - Video Category Management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", categoryService.createCategory(request)));
    }

    @GetMapping
    @Operation(summary = "Get all categories (including inactive)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active categories only")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a category by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get a category by URL slug")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryBySlug(slug)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.updateCategory(id, request)));
    }

    @PatchMapping("/{id}/rename")
    @Operation(summary = "Rename a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> renameCategory(
            @PathVariable Long id, @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Category renamed", categoryService.renameCategory(id, name)));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge one category into another (all videos will be reassigned)")
    public ResponseEntity<ApiResponse<CategoryResponse>> mergeCategories(
            @Valid @RequestBody MergeCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Categories merged successfully", categoryService.mergeCategories(request)));
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Toggle a category active/inactive")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category status toggled", categoryService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (only if it has no videos)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}

