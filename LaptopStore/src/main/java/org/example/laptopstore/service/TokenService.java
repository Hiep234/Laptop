package org.example.laptopstore.service;


import com.nimbusds.jose.JOSEException;
import org.example.laptopstore.entity.User;

import java.text.ParseException;

public interface TokenService {
    String generateToken(User userAccount, int expirationHours);

    boolean verifyToken(String token) throws ParseException, JOSEException;

    long getTimeToLive(String token) throws ParseException;

    String getClaim(String token, String claim) throws ParseException;

    String getJWT();
}
