package org.example.laptopstore.service;


import org.example.laptopstore.dto.request.account.AuthenticationResponse;

public interface UserAuthentication {
    AuthenticationResponse authenticate(String username);
}
