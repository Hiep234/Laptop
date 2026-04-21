package org.example.laptopstore.dto.request.account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAccountRequest {
    private Long id;
    private String username;
    private String email;
    private BigDecimal balance;
    private LocalDate vipExpiry;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
