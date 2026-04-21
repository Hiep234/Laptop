package org.example.laptopstore.dto.response.product.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.example.laptopstore.dto.response.image.ImageThumbnailResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private CategoryResponse category;

    private BrandResponse brand;

    private Long salesCount;

    private Double ratingAverage;

    private List<ImageThumbnailResponse> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isDelete;

    List<ProductOptionResponse> options;
}
