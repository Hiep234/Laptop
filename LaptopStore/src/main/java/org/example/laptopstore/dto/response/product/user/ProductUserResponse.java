package org.example.laptopstore.dto.response.product.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.example.laptopstore.dto.response.image.ImageThumbnailResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductUserResponse {

    private Long id;

    private String name;

    private String description;

    private CategoryResponse category;

    private BrandResponse brand;

    List<ImageThumbnailResponse> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isDelete;
}
