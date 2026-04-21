package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;

import org.example.laptopstore.dto.request.account.ChangePasswordRequest;
import org.example.laptopstore.dto.request.account.LoginRequest;
import org.example.laptopstore.dto.request.account.RegisterRequest;
import org.example.laptopstore.dto.response.ApiResponse;

import org.example.laptopstore.dto.response.account.LoginResponse;
import org.example.laptopstore.dto.response.account.RegisterReponse;
import org.example.laptopstore.service.UserAccountService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

import static org.example.laptopstore.util.Constant.PASSWORD_CHANGE_SUCESSFUL;
import static org.example.laptopstore.util.Constant.SUCCESS;
import static org.example.laptopstore.util.Constant.SUCCESS_MESSAGE;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserAccountService userService;

    @PostMapping("/register")
    public ApiResponse<Object> register(@RequestBody RegisterRequest request) {
        RegisterReponse registeredUser = userService.register(request);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(registeredUser)
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<Object> login(@RequestBody LoginRequest request) throws ParseException {
        LoginResponse loginResponse = userService.login(request);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(loginResponse)
                .build();
    }

    @PostMapping("/change-password")
    public ApiResponse<Object> changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        userService.changePassword(username, request);
        
        return ApiResponse.builder()
                .message(PASSWORD_CHANGE_SUCESSFUL)
                .code(SUCCESS)
                .data(SUCCESS)
                .build();
    }

    @GetMapping("/{username}")
    public ApiResponse<Object> changePassword(@PathVariable String username) {
        return ApiResponse.builder()
                .message(PASSWORD_CHANGE_SUCESSFUL)
                .code(SUCCESS)
                .data(userService.getUserById(username))
                .build();
    }

    @GetMapping("/balance/{id}")
    public ApiResponse<Object> getBalance(@PathVariable Long id) {
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(userService.getBalance(id))
                .build();
    }


} 