package org.example.laptopstore.dto.request.discount;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.laptopstore.util.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DiscountRequest {

    @NotNull(message = "Product ID is required")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Is active is required")
    private Boolean isActive;

}
