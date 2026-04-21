package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.withdrawal.WithdrawalRequest;
import org.example.laptopstore.dto.response.withdrawal.WithdrawalResponse;
import org.example.laptopstore.util.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;

import java.text.ParseException;
import java.time.LocalDate;

public interface WithdrawalService {
    WithdrawalResponse requestWithdrawal(WithdrawalRequest withdrawalRequest) throws ParseException;
    Page<WithdrawalResponse> getAllWithdrawals(LocalDate startDate, LocalDate endDate, WithdrawalStatus status, int page, int size, String sortBy, String sortDirection);
    Page<WithdrawalResponse> getAllWithdrawalsByUser(LocalDate startDate, LocalDate endDate, WithdrawalStatus status, int page, int size, String sortBy, String sortDirection) throws ParseException;
    WithdrawalResponse updateStatus(Long id, WithdrawalRequest withdrawalRequest);
}