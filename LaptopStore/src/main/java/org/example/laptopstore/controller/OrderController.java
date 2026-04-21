package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.order.OrderRequest;
import org.example.laptopstore.dto.request.order.OrderStatusRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.order.OrderResponse;
import org.example.laptopstore.service.OrderSerivce;
import org.example.laptopstore.util.Constant;
import org.example.laptopstore.util.enums.OrderStatus;
import org.example.laptopstore.util.enums.PaymentMethod;
import org.example.laptopstore.util.enums.PaymentStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

import static org.example.laptopstore.util.Constant.PASSWORD_CHANGE_SUCESSFUL;
import static org.example.laptopstore.util.Constant.SUCCESS;
import static org.example.laptopstore.util.Constant.SUCCESS_MESSAGE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/order")
public class OrderController {
    private final OrderSerivce orderSerivce;
    @PostMapping
    public ApiResponse<Object> insertOrder(@RequestBody OrderRequest orderRequest) {
        OrderResponse response = orderSerivce.insertOrder(orderRequest);
        return ApiResponse.builder()
                .message(SUCCESS_MESSAGE)
                .code(SUCCESS)
                .data(response)
                .build();
    }
    @GetMapping("/history/{userId}")
    public ApiResponse<Object> getHistoryOrder(@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "5") int size,@RequestParam(required = false)OrderStatus orderStatus,@RequestParam(required = false)String sort,@PathVariable Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(orderSerivce.getHistoryOrders(pageable,userId,orderStatus,sort))
                .build();
    }
    @PutMapping("/refund/{orderId}")
    public ApiResponse<Object> refund(@PathVariable Long orderId) {
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(orderSerivce.refund(orderId))
                .build();
    }
    @PutMapping("/cancel/{orderId}")
    public ApiResponse<Object> cancelOrder(@PathVariable Long orderId) {
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(orderSerivce.cancel(orderId))
                .build();
    }

    @GetMapping("/test")
    public ApiResponse<Object> tt() {
        orderSerivce.restoreOrderToSystem();
        return ApiResponse.builder()
                .message(PASSWORD_CHANGE_SUCESSFUL)
                .code(SUCCESS)
                .build();
    }

    @GetMapping("/page")
    public ApiResponse<Object> adminGetAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) OrderStatus orderStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        Pageable pageable = PageRequest.of(page -1, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(SUCCESS_MESSAGE)
                .data(new PageResponse<>(orderSerivce.getAllOrder(startDate, endDate, paymentMethod, paymentStatus, orderStatus, pageable)))
                .build();
    }

    @PutMapping("/update/status/{orderId}")
    public ApiResponse<Object> updateStatus(@PathVariable Long orderId, @RequestBody OrderStatusRequest status) {
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(SUCCESS_MESSAGE)
                .data(orderSerivce.updateStatus(orderId, status))
                .build();
    }

    @PutMapping("/accept/refund/{orderId}")
    public ApiResponse<Object> acceptRefund(@PathVariable Long orderId) {
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(SUCCESS_MESSAGE)
                .data(orderSerivce.acceptRefund(orderId))
                .build();
    }
}
