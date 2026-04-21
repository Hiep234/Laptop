package org.example.laptopstore.dto.response.order;

import lombok.Data;
import org.example.laptopstore.dto.response.discount.DiscountResponse;
import org.example.laptopstore.dto.response.user.UserResponse;
import org.example.laptopstore.entity.InfoUserReceive;
import org.example.laptopstore.util.enums.OrderStatus;
import org.example.laptopstore.util.enums.PaymentMethod;
import org.example.laptopstore.util.enums.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderAdminResponse {
    private Long id;
    private UserResponse user;
    private Long infoUserReceiveId;
    private InfoUserReceive infoUserReceive;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String note;
    private DiscountResponse discount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> orderItems;
}
