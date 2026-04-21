package org.example.laptopstore.service;



import org.example.laptopstore.dto.request.account.ChangePasswordRequest;
import org.example.laptopstore.dto.request.account.LoginRequest;
import org.example.laptopstore.dto.request.account.RegisterRequest;
import org.example.laptopstore.dto.response.account.LoginResponse;
import org.example.laptopstore.dto.response.account.RegisterReponse;
import org.example.laptopstore.dto.response.user.UserAdminResponse;
import org.example.laptopstore.entity.User;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.text.ParseException;

public interface UserAccountService {

    User getUserByUsername(String username);
    User getUserById(Long idUser);

    LoginResponse login(LoginRequest request) throws ParseException;

    RegisterReponse register(RegisterRequest registerRequest);

    User saveUser(User user);

    void changePassword(String username, ChangePasswordRequest request);

    LoginResponse getUserById(String username);

    Page<UserAdminResponse> getUserByAdmin(String keyword, int page, int size, String sortBy, String sortDir);

    void blockUser(Long userId);

    BigDecimal getBalance(Long id);

    void updateBalance(Long id, BigDecimal balance);

    Integer totalCustomerByMonthAndYear(Integer month, Integer year);

}
