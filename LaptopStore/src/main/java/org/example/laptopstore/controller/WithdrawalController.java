package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.withdrawal.WithdrawalRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.withdrawal.WithdrawalResponse;
import org.example.laptopstore.service.WithdrawalService;
import org.example.laptopstore.util.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/withdrawals")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    @PostMapping("/create")
    public ApiResponse<Object> requestWithdrawal(@RequestBody WithdrawalRequest withdrawalRequest) throws ParseException {
        WithdrawalResponse response = withdrawalService.requestWithdrawal(withdrawalRequest);
        return ApiResponse.builder()
                .code(HttpStatus.CREATED.value())
                .message("Withdrawal request created successfully")
                .data(response)
                .build();
    }

    @GetMapping("/admin/page")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> getAllWithdrawals(
            @RequestParam(required = false ) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) WithdrawalStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Page<WithdrawalResponse> withdrawalResponsePage = withdrawalService.getAllWithdrawals(startDate, endDate, status, page - 1, size, sortBy, sortDirection);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("All withdrawals retrieved successfully")
                .data(new PageResponse<>(withdrawalResponsePage))
                .build();
    }

    @GetMapping("/user/page")
    public ApiResponse<Object> getAllWithdrawalsByUser(
            @RequestParam(required = false ) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) WithdrawalStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) throws ParseException {
        Page<WithdrawalResponse> withdrawalResponsePage = withdrawalService.getAllWithdrawalsByUser(startDate, endDate, status, page - 1, size, sortBy, sortDirection);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("User withdrawals retrieved successfully")
                .data(new PageResponse<>(withdrawalResponsePage))
                .build();
    }

    @PutMapping("/update/status/{id}")
    public ApiResponse<Object> updateStatus(@PathVariable Long id, @RequestBody WithdrawalRequest withdrawalRequest) {
        WithdrawalResponse response = withdrawalService.updateStatus(id, withdrawalRequest);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Withdrawal status updated successfully")
                .data(response)
                .build();
    }
}