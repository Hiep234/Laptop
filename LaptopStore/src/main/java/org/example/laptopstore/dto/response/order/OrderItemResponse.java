package org.example.laptopstore.dto.response.order;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class OrderItemResponse {
    private Long orderItemId;
    private Long productVariantId;
    private String productCode;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal priceAtOrderTime;
    private String productColor;

}
