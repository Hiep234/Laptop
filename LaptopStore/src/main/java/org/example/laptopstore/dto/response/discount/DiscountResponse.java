package org.example.laptopstore.dto.response.discount;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.util.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DiscountResponse {

    private Long id;

    private String code;

    private String description;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private LocalDateTime startDate;

    private Integer quantity;

    private LocalDateTime endDate;

    private Boolean isActive;

    private Boolean isDelete;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
