package org.example.laptopstore.dto.response.product.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.product.admin.ProductVariantResponse;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductOptionListUserResponse {

    private Long id;

    private ProductListUserResponse product;

    private ProductVariantResponse productVariant;

    private Long salesCount;

    private Double ratingAverage;

    private String code;

    private BigDecimal price;

    private String cpu;

    private String gpu;

    private String ram;

    private String ramType;

    private String storage;

    private String displaySize;

}
