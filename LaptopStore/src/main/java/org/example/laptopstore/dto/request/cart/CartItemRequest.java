package org.example.laptopstore.dto.request.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemRequest {
    private Integer quantity;
    private Long productVariantId;
    private Long userId;
}
