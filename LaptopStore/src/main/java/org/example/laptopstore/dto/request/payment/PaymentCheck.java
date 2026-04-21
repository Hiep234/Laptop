package org.example.laptopstore.dto.request.payment;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCheck {
    private BigDecimal amount;
    private Long orderId;
    private Long userId;
    private Integer type;
}
