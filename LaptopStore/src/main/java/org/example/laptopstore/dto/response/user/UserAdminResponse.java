package org.example.laptopstore.dto.response.user;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserAdminResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal balance;
    private Boolean isBlocked;
}
