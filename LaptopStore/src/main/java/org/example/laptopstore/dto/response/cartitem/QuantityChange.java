package org.example.laptopstore.dto.response.cartitem;

import lombok.Data;

@Data
public class QuantityChange {
    private Long idCartItem;
    private Integer quantity;
    private String result;
}
