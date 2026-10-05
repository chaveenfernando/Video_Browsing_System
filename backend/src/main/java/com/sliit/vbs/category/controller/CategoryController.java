package com.sliit.vbs.category.controller;

import com.sliit.vbs.category.entity.Category;
import com.sliit.vbs.category.repository.CategoryRepository;
import com.sliit.vbs.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

<<<<<<< Updated upstream
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved"));
=======
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.createCategory(request), "Category created"));
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
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(id, request), "Category updated"));
    }

    @PatchMapping("/{id}/rename")
    @Operation(summary = "Rename a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> renameCategory(
            @PathVariable Long id, @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.renameCategory(id, name), "Category renamed"));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge one category into another (all videos will be reassigned)")
    public ResponseEntity<ApiResponse<CategoryResponse>> mergeCategories(
            @Valid @RequestBody MergeCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.mergeCategories(request), "Categories merged successfully"));
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Toggle a category active/inactive")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.toggleActive(id), "Category status toggled"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (only if it has no videos)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
>>>>>>> Stashed changes
    }
}
