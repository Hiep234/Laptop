package org.example.laptopstore.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.example.laptopstore.util.Constant.REQUEST_FAILD;


@ControllerAdvice
public class GlobalExceptionHandle {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiException> handleDepartmentException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiException apiException = new ApiException();
        apiException.setCode(errorCode.getCode());
        apiException.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(apiException);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiException> handleIOException(NotFoundException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.NOT_FOUND.value()).message(ex.getMessage()).build());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiException> handleException(Exception ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.INTERNAL_SERVER_ERROR.value()).message(ex.getMessage()).build());
    }
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiException> handleIOException(IOException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.INTERNAL_SERVER_ERROR.value()).message(ex.getMessage()).build());
    }

    // Xử lý lỗi NullPointerException
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiException> handleNullPointerException(NullPointerException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.INTERNAL_SERVER_ERROR.value()).message(ex.getMessage()).build());
    }

    // Xử lý lỗi NoSuchElementException (ví dụ: khi không tìm thấy phần tử trong list)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiException> handleNoSuchElementException(NoSuchElementException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.NOT_FOUND.value()).message(ex.getMessage()).build());
    }

    // Xử lý lỗi tất cả các lỗi của HTTP (ví dụ: lỗi 405, 500, v.v.)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiException> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.METHOD_NOT_ALLOWED.value()).message(ex.getMessage()).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiException> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.BAD_REQUEST.value()).message(REQUEST_FAILD).data(errors).build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiException> handleValidationExceptions(MaxUploadSizeExceededException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.PAYLOAD_TOO_LARGE.value()).message(ex.getMessage()).build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiException> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.BAD_REQUEST.value()).message(ex.getMessage()).build());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiException> handleHttpMessageNotReadableException(BadRequestException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.BAD_REQUEST.value()).message(ex.getMessage()).build());
    }
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiException> handleConflictException(ConflictException ex) {
        return ResponseEntity.ok(ApiException.builder().code(HttpStatus.CONFLICT.value()).message(ex.getMessage()).build());
    }
}
