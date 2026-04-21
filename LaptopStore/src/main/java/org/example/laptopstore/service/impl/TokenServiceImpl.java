package org.example.laptopstore.service.impl;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.entity.User;
import org.example.laptopstore.exception.AppException;
import org.example.laptopstore.exception.ErrorCode;
import org.example.laptopstore.service.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import static org.example.laptopstore.util.Constant.APPLICATION_NAME;
import static org.example.laptopstore.util.Constant.NO_TOKEN;
import static org.example.laptopstore.util.Constant.SCOPE;


/**
 * Lớp triển khai TokenService.
 * Xử lý việc tạo, xác thực, và lấy thông tin từ token JWT.
 */
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    // Khóa bí mật dùng để ký JWT, được cấu hình trong file `application.properties`.
    @Value("${jwt.signerKey}")
    private String jwtKey;

    /**
     * Tạo token JWT cho người dùng với thời gian hết hạn xác định.
     *
     * @param userAccount Thông tin người dùng cần tạo token.
     * @param expirationHours Thời gian hết hạn (theo giờ).
     * @return Chuỗi JWT đã ký.
     */
    @Override
    public String generateToken(User userAccount, int expirationHours) {
        // Thiết lập header của JWT với thuật toán ký HS512.
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        // Tạo claims (dữ liệu bên trong token), bao gồm thông tin người dùng và thời gian hết hạn.
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(userAccount.getUsername()) // Đặt username làm subject.
                .jwtID(UUID.randomUUID().toString()) // Sinh mã định danh duy nhất cho JWT.
                .issuer(APPLICATION_NAME) // Tên ứng dụng phát hành token.
                .issueTime(new Date()) // Thời gian phát hành token.
                .expirationTime(new Date(
                        Instant.now().plus(expirationHours, ChronoUnit.DAYS).toEpochMilli())) // Thời gian hết hạn.
                .claim(SCOPE, userAccount.getRole().getName()) // Thêm thông tin vai trò (role) vào claims.
                .build();

        // Tạo payload chứa các claims.
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        // Kết hợp header và payload để tạo JWSObject (đối tượng token).
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            // Ký token bằng khóa bí mật (jwtKey).
            jwsObject.sign(new MACSigner(jwtKey.getBytes()));
            return jwsObject.serialize(); // Trả về chuỗi token đã ký.
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.ERROR_TOKEN_INVALID); // Ném ngoại lệ nếu quá trình ký gặp lỗi.
        }
    }

    /**
     * Xác minh chữ ký của token JWT.
     *
     * @param token Chuỗi JWT cần xác minh.
     * @return True nếu token hợp lệ, ngược lại là False.
     * @throws ParseException Nếu xảy ra lỗi khi phân tích token.
     * @throws JOSEException Nếu xảy ra lỗi khi xác minh token.
     */
    @Override
    public boolean verifyToken(String token) throws ParseException, JOSEException {
        // Tạo đối tượng xác minh với khóa bí mật.
        JWSVerifier verifier = new MACVerifier(jwtKey.getBytes());

        // Phân tích chuỗi token thành đối tượng SignedJWT.
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Xác minh chữ ký của token.
        return signedJWT.verify(verifier);
    }

    /**
     * Lấy thời gian sống (TTL) còn lại của token (tính theo phút).
     *
     * @param token Chuỗi JWT cần kiểm tra.
     * @return Thời gian sống còn lại của token (theo phút).
     * @throws ParseException Nếu xảy ra lỗi khi phân tích token.
     */
    @Override
    public long getTimeToLive(String token) throws ParseException {
        // Phân tích chuỗi token thành đối tượng SignedJWT.
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Lấy thông tin thời gian phát hành và hết hạn từ claims.
        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
        Date issueTime = claimsSet.getIssueTime();
        Date expirationTime = claimsSet.getExpirationTime();

        // Tính toán TTL bằng cách lấy chênh lệch giữa thời gian hết hạn và thời gian phát hành.
        return (expirationTime.getTime() - issueTime.getTime()) / (1000 * 60);
    }

    /**
     * Lấy giá trị của một claim trong token JWT.
     *
     * @param token Chuỗi JWT cần phân tích.
     * @param claim Tên claim cần lấy giá trị.
     * @return Giá trị của claim dưới dạng chuỗi.
     * @throws ParseException Nếu xảy ra lỗi khi phân tích token.
     */
    @Override
    public String getClaim(String token, String claim) throws ParseException {
        if(token.equals(NO_TOKEN)){
            return NO_TOKEN;
        }
        // Phân tích chuỗi token thành đối tượng SignedJWT.
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Lấy claims từ token và trả về giá trị của claim được yêu cầu.
        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
        return claimsSet.getStringClaim(claim);
    }

    /**
     * Lấy JWT hiện tại từ SecurityContext (dành cho người dùng đang đăng nhập).
     *
     * @return Chuỗi JWT hiện tại.
     */
    @Override
    public String getJWT() {
        // Lấy thông tin xác thực hiện tại từ SecurityContext.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null){
            return NO_TOKEN;
        }
        // Lấy đối tượng Jwt từ thông tin xác thực và trả về chuỗi token.
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getTokenValue();
    }
}
