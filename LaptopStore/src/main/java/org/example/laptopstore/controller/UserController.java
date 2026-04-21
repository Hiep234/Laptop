package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.user.UserAdminResponse;
import org.example.laptopstore.service.UserAccountService;
import org.example.laptopstore.service.impl.MessageChatService;
import org.example.laptopstore.util.Constant;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserAccountService userAccountService;
    private final MessageChatService messageChatService;
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> adminGetAllUsers(@RequestParam(required = false, defaultValue = "") String keyword,
                                                @RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                @RequestParam(defaultValue = "createdAt") String sortBy,
                                                @RequestParam(defaultValue = "desc") String sortDir
                                                ) {
        Page<UserAdminResponse> userPage = userAccountService.getUserByAdmin(keyword, page-1, size, sortBy, sortDir);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(new PageResponse<>(userPage))
                .build();
    }
    @PutMapping("/block/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> blockUser(@PathVariable("userId") Long userId) {
        userAccountService.blockUser(userId);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .build();
    }

    @GetMapping("/information")
    public ApiResponse<Object> getInfoUserMessage(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(messageChatService.getAllUser(page,size)).build();
    }

    @GetMapping("/message")
    public ApiResponse<Object> getUserMessage(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam Long senderId,@RequestParam Long receiverId) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(messageChatService.getMessageUser(page,size,receiverId,senderId)).build();
    }
}
