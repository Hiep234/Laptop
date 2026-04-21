package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.discount.DiscountRequest;
import org.example.laptopstore.dto.response.discount.DiscountResponse;
import org.example.laptopstore.entity.Discount;
import org.example.laptopstore.util.enums.DiscountType;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DiscountService {

    DiscountResponse getDiscountById(Long id);
    Page<DiscountResponse> getAllDiscountsPagination(String keyword, DiscountType discountType, Boolean isActive, LocalDate startDate, LocalDate endDate, int page, int size, String sortBy, String sortDir);
    DiscountResponse createDiscount(DiscountRequest discountRequest);
    DiscountResponse updateDiscount(Long id, DiscountRequest discountRequest);
    void deleteDiscount(Long id);
    void miniusDiscount(Long id);
}
