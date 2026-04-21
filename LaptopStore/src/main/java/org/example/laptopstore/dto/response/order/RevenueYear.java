package org.example.laptopstore.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RevenueYear {
    private Integer year;
    private BigDecimal revenueInYear;

}
