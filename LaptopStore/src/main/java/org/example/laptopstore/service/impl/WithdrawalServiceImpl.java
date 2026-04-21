package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.withdrawal.WithdrawalRequest;
import org.example.laptopstore.dto.response.withdrawal.WithdrawalResponse;
import org.example.laptopstore.entity.User;
import org.example.laptopstore.entity.Withdrawal;
import org.example.laptopstore.exception.BadRequestException;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.mapper.WithdrawalMapper;
import org.example.laptopstore.repository.UserRepository;
import org.example.laptopstore.repository.WithdrawalRepository;
import org.example.laptopstore.service.TokenService;
import org.example.laptopstore.service.WithdrawalService;
import org.example.laptopstore.util.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.example.laptopstore.util.Constant.SUB;
import static org.example.laptopstore.util.Constant.USER_NOT_VALID;

@Service
@RequiredArgsConstructor
public class WithdrawalServiceImpl implements WithdrawalService {

    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final WithdrawalMapper withdrawalMapper;
    private final WithdrawalRepository withdrawalRepository;
    @Override
    @Transactional
    public WithdrawalResponse requestWithdrawal(WithdrawalRequest withdrawalRequest) throws ParseException {
        String username = tokenService.getClaim(tokenService.getJWT(), SUB);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotFoundException(USER_NOT_VALID);
        }
        if(withdrawalRequest.getAmount().compareTo(user.getBalance()) > 0) {
            throw new BadRequestException("Insufficient balance for withdrawal");
        }
        user.setBalance(user.getBalance().subtract(withdrawalRequest.getAmount()));
        userRepository.save(user);
        Withdrawal withdrawal = withdrawalMapper.mapToEntity(withdrawalRequest);
        withdrawal.setUser(user);
        withdrawal.setStatus(WithdrawalStatus.PENDING);
        Withdrawal savedWithdrawal = withdrawalRepository.save(withdrawal);
        return withdrawalMapper.mapToResponse(savedWithdrawal);
    }

    @Override
    public Page<WithdrawalResponse> getAllWithdrawals(LocalDate startDate, LocalDate endDate, WithdrawalStatus status, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        Page<Withdrawal> withdrawalPage = withdrawalRepository.adminGetAll(startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.atTime(LocalTime.MAX) : null, status, pageable);
        return withdrawalPage.map(withdrawalMapper::mapToResponse);
    }

    @Override
    public Page<WithdrawalResponse> getAllWithdrawalsByUser(LocalDate startDate, LocalDate endDate, WithdrawalStatus status, int page, int size, String sortBy, String sortDirection) throws ParseException {
        String username = tokenService.getClaim(tokenService.getJWT(), SUB);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotFoundException(USER_NOT_VALID);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        Page<Withdrawal> withdrawalPage = withdrawalRepository.getAllByUser(user, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.atTime(LocalTime.MAX) : null, status, pageable);
        return withdrawalPage.map(withdrawalMapper::mapToResponse);
    }

    @Override
    @Transactional
    public WithdrawalResponse updateStatus(Long id, WithdrawalRequest request) {
        Withdrawal withdrawal = withdrawalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Withdrawal request not found"));
        if(withdrawal.getStatus() == WithdrawalStatus.COMPLETED) {
            throw new BadRequestException("Withdrawal request is already completed");
        }
        if(request.getStatus() == WithdrawalStatus.APPROVED) {
            withdrawal.setStatus(request.getStatus());
            withdrawal.setAdminNote(request.getAdminNote());
        }
        else if(request.getStatus() == WithdrawalStatus.REJECTED){
            withdrawal.setStatus(request.getStatus());
            withdrawal.setAdminNote(request.getAdminNote());
            User user = withdrawal.getUser();
            user.setBalance(user.getBalance().add(request.getAmount()));
            userRepository.save(user);
        }
        else{
            withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        }
        return withdrawalMapper.mapToResponse(withdrawalRepository.save(withdrawal));
    }
}