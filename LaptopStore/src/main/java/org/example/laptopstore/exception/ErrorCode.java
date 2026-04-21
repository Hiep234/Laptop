package org.example.laptopstore.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.example.laptopstore.util.Constant.BAD_REQUEST;
import static org.example.laptopstore.util.Constant.BALANCE;
import static org.example.laptopstore.util.Constant.DEFAULT_ROLE_NOT_VALID;
import static org.example.laptopstore.util.Constant.EMAIL_EXIST;
import static org.example.laptopstore.util.Constant.EMAIL_REQUIRED_MESSAGE;
import static org.example.laptopstore.util.Constant.ERROR_LIST_EMPTY_MESSAGE;
import static org.example.laptopstore.util.Constant.ERROR_TOKEN_INVALID_MESSAGE;
import static org.example.laptopstore.util.Constant.INVALID_PASSWORD_FAIL;
import static org.example.laptopstore.util.Constant.NOT_ENOUGH_QUANTITY_SYSTEM;
import static org.example.laptopstore.util.Constant.NOT_FOUND;
import static org.example.laptopstore.util.Constant.NO_CONTENT_MESSAGE;
import static org.example.laptopstore.util.Constant.PAYMENT_NOT_VALID;
import static org.example.laptopstore.util.Constant.USERNAME_EXIST;
import static org.example.laptopstore.util.Constant.USER_NOT_VALID;
import static org.example.laptopstore.util.Constant.VIP_PACKAGE_ERROR;
import static org.example.laptopstore.util.Constant.VIP_TYPE_ERROR;


@Getter
public enum ErrorCode {
    ERROR_CODE_NOT_FOUND(NOT_FOUND, NO_CONTENT_MESSAGE, HttpStatus.NOT_FOUND),
    ERROR_LIST_EMPTY(BAD_REQUEST, ERROR_LIST_EMPTY_MESSAGE, HttpStatus.BAD_REQUEST),
    ERROR_EMAIL_REQUIRED(BAD_REQUEST, EMAIL_REQUIRED_MESSAGE, HttpStatus.BAD_REQUEST),
    ERROR_TOKEN_INVALID(BAD_REQUEST, ERROR_TOKEN_INVALID_MESSAGE, HttpStatus.BAD_REQUEST),
    USERNAME_EXISTS(BAD_REQUEST, USERNAME_EXIST, HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(BAD_REQUEST, EMAIL_EXIST, HttpStatus.BAD_REQUEST),
    BALANCE_NOT_ENOUGH(BAD_REQUEST, BALANCE, HttpStatus.BAD_REQUEST),
    DEFAULT_ROLE_NOT_FOUND(NOT_FOUND, DEFAULT_ROLE_NOT_VALID, HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(NOT_FOUND, USER_NOT_VALID, HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND(NOT_FOUND,PAYMENT_NOT_VALID,HttpStatus.BAD_REQUEST),
    VIP_TYPE_NOT_FOUND(NOT_FOUND, VIP_TYPE_ERROR, HttpStatus.NOT_FOUND),
    VIP_PACKAGE_NOT_FOUND(NOT_FOUND, VIP_PACKAGE_ERROR, HttpStatus.NOT_FOUND),
    NOT_ENOUGH_QUANTITY(NOT_FOUND, NOT_ENOUGH_QUANTITY_SYSTEM, HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(BAD_REQUEST, INVALID_PASSWORD_FAIL, HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

}
