package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.payment.PaymentCheck;
import org.example.laptopstore.dto.request.payment.PaymentRequest;
import org.example.laptopstore.dto.response.payment.PaymentResponse;
import org.example.laptopstore.entity.Order;
import org.example.laptopstore.entity.Payment;
import org.example.laptopstore.entity.User;
import org.example.laptopstore.exception.AppException;
import org.example.laptopstore.exception.ErrorCode;
import org.example.laptopstore.repository.PaymentRepository;
import org.example.laptopstore.repository.UserRepository;
import org.example.laptopstore.service.OrderSerivce;
import org.example.laptopstore.service.PaymentService;
import org.example.laptopstore.service.UserAccountService;
import org.example.laptopstore.util.enums.PaymentStatus;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final UserAccountService userAccountService;
    private final ModelMapper modelMapper;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final OrderSerivce orderSerivce;

    @Transactional
    @Override
    public PaymentResponse payment(String username, BigDecimal amount) {
        User user = userAccountService.getUserByUsername(username);
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentDate(LocalDateTime.now());

        paymentRequest.setAmount(amount);
        paymentRequest.setUserId(user.getId());

        return createPayment(paymentRequest);
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


        Payment payment = new Payment();
        payment.setUser(user);


        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());

        Payment savedPayment = paymentRepository.save(payment);
        return modelMapper.map(savedPayment, PaymentResponse.class);
    }


    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return modelMapper.map(payment, PaymentResponse.class);
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(payment -> modelMapper.map(payment, PaymentResponse.class))
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        return payments.stream()
                .map(payment -> modelMapper.map(payment, PaymentResponse.class))
                .toList();
    }


    @Override
    @Transactional
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
        }
        paymentRepository.deleteById(id);
    }

    @Override
    public PaymentCheck setPaymentCheck(PaymentCheck paymentCheck) {
        Order order = orderSerivce.findById(paymentCheck.getOrderId());

        // Gán order và user vào payment
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(userAccountService.getUserById(paymentCheck.getUserId()));
        payment.setAmount(paymentCheck.getAmount());
        payment.setPaymentDate(LocalDateTime.now());

        // Xử lý trạng thái đơn hàng
        if (paymentCheck.getType() == 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }

        orderSerivce.saved(order);
        return modelMapper.map(paymentRepository.save(payment), PaymentCheck.class);
    }

}
