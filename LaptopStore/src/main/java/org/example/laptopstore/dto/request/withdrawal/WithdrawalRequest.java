package org.example.laptopstore.dto.request.withdrawal;

import lombok.Data;
import org.example.laptopstore.util.enums.WithdrawalStatus;

import java.math.BigDecimal;

@Data
public class WithdrawalRequest {
    private String accountNumber;
    private BigDecimal amount;
    private String requestNote;
    private String adminNote;
    private WithdrawalStatus status;
}
