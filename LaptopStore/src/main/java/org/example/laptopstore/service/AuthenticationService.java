package org.example.laptopstore.service;



import org.example.laptopstore.dto.request.account.AuthenticationResponse;
import org.example.laptopstore.entity.User;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(User userAccounts) throws ParseException;

}
