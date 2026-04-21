package org.example.laptopstore.dto.response.product.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantResponse {

    private Long id;

    private String color;

    private BigDecimal priceDiff;

    private Integer stock;

    private String imageUrl;

    private Long salesCount;
}