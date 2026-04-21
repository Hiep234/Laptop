package org.example.laptopstore.dto.response.order;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class RevenueMonth {
    private int month;
    private BigDecimal totalRevenue;
    private long laptops;
    private Integer customers;
    public RevenueMonth(int month, BigDecimal totalRevenue, long laptops) {
        this.month = month;
        this.totalRevenue = totalRevenue;
        this.laptops = laptops;
    }

}
