package org.example.laptopstore.service;


import org.example.laptopstore.dto.request.payment.PaymentCheck;
import org.example.laptopstore.dto.request.payment.PaymentRequest;
import org.example.laptopstore.dto.response.payment.PaymentResponse;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    PaymentResponse payment(String username, BigDecimal amount);
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getAllPayments();
    List<PaymentResponse> getPaymentsByUserId(Long userId);
    void deletePayment(Long id);
    PaymentCheck setPaymentCheck(PaymentCheck paymentCheck);
}
