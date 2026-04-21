package org.example.laptopstore.dto.request.order;

import lombok.Data;
import org.example.laptopstore.util.enums.OrderStatus;

@Data
public class OrderStatusRequest {
    private OrderStatus status;
}
