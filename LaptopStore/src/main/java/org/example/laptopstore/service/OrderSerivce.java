package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.order.OrderRequest;
import org.example.laptopstore.dto.request.order.OrderStatusRequest;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.order.HistoryOrder;
import org.example.laptopstore.dto.response.order.OrderAdminResponse;
import org.example.laptopstore.dto.response.order.OrderResponse;
import org.example.laptopstore.dto.response.order.RevenueMonth;
import org.example.laptopstore.dto.response.order.RevenueYear;
import org.example.laptopstore.entity.Order;

import org.example.laptopstore.util.enums.OrderStatus;
import org.example.laptopstore.util.enums.PaymentMethod;
import org.example.laptopstore.util.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface OrderSerivce {
    OrderResponse insertOrder(OrderRequest orderRequest);
    Order findById(Long id);
    BigDecimal totalOrder(Long orderId);
    Order saved(Order order);

    void restoreOrderToSystem();

    PageResponse<HistoryOrder> getHistoryOrders(Pageable pageable, Long userId, OrderStatus status, String sort);

    OrderResponse refund(Long orderId);
    OrderResponse cancel(Long orderId);
    Page<OrderAdminResponse> getAllOrder(LocalDate startDate, LocalDate endDate,PaymentMethod paymentMethod, PaymentStatus paymentStatus, OrderStatus orderStatus, Pageable pageable);
    OrderResponse updateStatus(Long orderId, OrderStatusRequest orderStatusRequest);
    List<RevenueYear> revenueInYear();
    List<RevenueMonth> revenueMonth(Integer year);

    OrderResponse acceptRefund(Long orderId);
}
