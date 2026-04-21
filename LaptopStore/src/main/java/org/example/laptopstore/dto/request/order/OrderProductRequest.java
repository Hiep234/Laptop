package org.example.laptopstore.dto.request.order;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class OrderProductRequest {
    private Long idCartItem;
    private Long productVariantId;
    private Integer quantity;
    private String productCode;
    private String productName;
    private String productImage;
    private BigDecimal priceAtOrderTime;
    private String productColor;
}
