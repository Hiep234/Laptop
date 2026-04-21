package org.example.laptopstore.dto.request.productreview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductReviewRequest {

    @NotNull(message = "ProductOption is required")
    private Long productOptionId;

    @NotNull(message = "Rating must be between 1 and 5")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @NotNull(message = "Comment is required")
    private String comment;
}
