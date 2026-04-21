package org.example.laptopstore.dto.response.product.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class ProductOptionShortResponse {

    private Long id;

    private String code;

    private String cpu;

    private String ram;

    private String gpu;

    private String storage;

    private BigDecimal price;
}
