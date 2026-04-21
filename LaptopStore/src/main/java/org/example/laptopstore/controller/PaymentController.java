package org.example.laptopstore.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.laptopstore.dto.request.payment.PaymentCheck;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.payment.PaymentResponse;
import org.example.laptopstore.entity.District;
import org.example.laptopstore.payment.VNPAYService;
import org.example.laptopstore.service.PaymentService;
import org.example.laptopstore.util.Constant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

import static org.example.laptopstore.util.Constant.SUCCESS;
import static org.example.laptopstore.util.Constant.SUCCESS_MESSAGE;


@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final VNPAYService vnpayService;
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping
    public ApiResponse<Object> createPayment(@Valid @RequestParam String username, @Valid @RequestParam BigDecimal amount) {
        PaymentResponse response = paymentService.payment(username,amount);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(response)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getPaymentById(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(response)
                .build();
    }

    @GetMapping
    public ApiResponse<Object> getAllPayments() {
        List<PaymentResponse> response = paymentService.getAllPayments();
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(response)
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<Object> getPaymentsByUserId(@PathVariable Long userId) {
        List<PaymentResponse> response = paymentService.getPaymentsByUserId(userId);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(response)
                .build();
    }


    @DeleteMapping("/{id}")
    public ApiResponse<Object> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<Object> createPayment(
            HttpServletRequest request,
            @RequestParam long amount,
            @RequestParam String orderInfo
    ) {
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS).data(vnpayService.createOrder(request, amount, orderInfo))
                .build();
    }

    @PostMapping("/check")
    public ApiResponse<Object> getPaymentCheck(@RequestBody PaymentCheck paymentCheck) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(paymentService.setPaymentCheck(paymentCheck)).build();
    }

} 