package com.sliit.vbs.category.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for merging one category into another.
 * All videos in the source category will be re-assigned to the target category.
 *
 * @author IT25102597
 */
public class MergeCategoryRequest {

    @NotNull(message = "Source category ID is required")
    private Long sourceCategoryId;

    @NotNull(message = "Target category ID is required")
    private Long targetCategoryId;

    public Long getSourceCategoryId() { return sourceCategoryId; }
    public void setSourceCategoryId(Long sourceCategoryId) { this.sourceCategoryId = sourceCategoryId; }
    public Long getTargetCategoryId() { return targetCategoryId; }
    public void setTargetCategoryId(Long targetCategoryId) { this.targetCategoryId = targetCategoryId; }
}
