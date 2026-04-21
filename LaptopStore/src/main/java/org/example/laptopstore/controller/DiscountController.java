package org.example.laptopstore.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.discount.DiscountRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.discount.DiscountResponse;
import org.example.laptopstore.service.DiscountService;
import org.example.laptopstore.util.Constant;
import org.example.laptopstore.util.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/discounts")
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping("/page")
    public ApiResponse<Object> getDiscountsPagination(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) DiscountType discountType,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<DiscountResponse> discountResponses =  discountService.getAllDiscountsPagination(keyword, discountType, isActive, startDate, endDate,page - 1, size, sortBy, sortDir);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(new PageResponse<>(discountResponses)).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getDiscountDetail(@PathVariable Long id) {
        DiscountResponse discountResponse = discountService.getDiscountById(id);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(discountResponse).build();
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> createDiscount(@RequestBody @Valid DiscountRequest discountRequest) {
        DiscountResponse discountResponse = discountService.createDiscount(discountRequest);
        return ApiResponse.builder().code(HttpStatus.CREATED.value()).message(Constant.SUCCESS_MESSAGE).data(discountResponse).build();
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> updateDiscount(@PathVariable Long id, @RequestBody @Valid DiscountRequest discountRequest) {
        DiscountResponse discountResponse = discountService.updateDiscount(id, discountRequest);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(discountResponse).build();
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ApiResponse.builder().code(HttpStatus.NO_CONTENT.value()).message(Constant.SUCCESS_MESSAGE).build();
    }
}
