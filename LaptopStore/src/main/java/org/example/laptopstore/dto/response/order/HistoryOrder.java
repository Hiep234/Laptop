package org.example.laptopstore.dto.response.order;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.util.enums.OrderStatus;
import org.example.laptopstore.util.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HistoryOrder {
    private Long orderId;
    private List<OrderItemResponse> orderItems;
    private String email;
    private String numberPhone;
    private String detailAddress;
    private BigDecimal discount;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
}
