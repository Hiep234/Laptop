package org.example.laptopstore.dto.response.product.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.dto.response.category.CategoryResponse;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductListUserResponse {
    private Long id;

    private String name;

    private String description;

    private CategoryResponse category;

    private BrandResponse brand;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isDelete;
}
