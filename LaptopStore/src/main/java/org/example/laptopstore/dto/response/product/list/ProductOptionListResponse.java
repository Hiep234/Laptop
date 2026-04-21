package org.example.laptopstore.dto.response.product.list;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductOptionListResponse {

    private Long id;

    private String code;

    private BigDecimal price;

}
