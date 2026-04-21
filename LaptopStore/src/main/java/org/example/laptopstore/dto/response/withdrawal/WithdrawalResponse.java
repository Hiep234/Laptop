package org.example.laptopstore.dto.response.withdrawal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.user.UserResponse;
import org.example.laptopstore.util.enums.WithdrawalStatus;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalResponse {
    private Long id;
    private UserResponse user;
    private BigDecimal amount;
    private String accountNumber;
    private String requestNote;
    private String adminNote;
    private WithdrawalStatus status;
    private String createdAt;
    private String updatedAt;
}
