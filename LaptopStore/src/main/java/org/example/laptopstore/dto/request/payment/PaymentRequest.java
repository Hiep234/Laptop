package org.example.laptopstore.dto.request.payment;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    @NotNull
    private Long userId;
    
    private Long vipPackageId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDateTime paymentDate;


} 