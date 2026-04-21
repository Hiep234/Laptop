package org.example.laptopstore.dto.response.cartitem;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private String productName;
    private String productCode;
    private String cpu;
    private String ram;
    private String storage;
    private String gpu;
    private String color;
    private BigDecimal basePrice;
    private String imageUrl;
    private Integer quantity;

    public CartItemResponse(Long id,
                            Long variantId,
                            String productName,
                            String productCode,
                            String cpu,
                            String ram,
                            String storage,
                            String gpu,
                            String color,
                            BigDecimal basePrice,
                            BigDecimal priceDiff,
                            String imageUrl,
                            Integer quantity) {
        this.id = id;
        this.variantId = variantId;
        this.productName = productName;
        this.productCode = productCode;
        this.cpu = cpu;
        this.ram = ram;
        this.storage = storage;
        this.gpu = gpu;
        this.color = color;
        this.basePrice = basePrice.add(priceDiff);
        this.imageUrl = imageUrl;
        this.quantity = quantity;
    }

}
