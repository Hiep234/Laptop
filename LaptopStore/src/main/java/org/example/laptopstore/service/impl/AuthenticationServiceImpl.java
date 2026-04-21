package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.account.AuthenticationResponse;
import org.example.laptopstore.entity.User;
import org.example.laptopstore.service.AuthenticationService;
import org.example.laptopstore.service.TokenService;
import org.springframework.stereotype.Service;

import java.text.ParseException;



/**
 * Lớp triển khai AuthenticationService.
 * Quản lý việc xác thực người dùng, tạo token, và quản lý phiên làm việc.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final TokenService tokenService;

    @Override
    public AuthenticationResponse authenticate(User userAccounts) throws ParseException {
        // Tạo access token ngắn hạn (1 giờ).
        String accessToken = tokenService.generateToken(userAccounts, 1);

        // Trả về các token trong phản hồi.
        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .build();
    }


}
