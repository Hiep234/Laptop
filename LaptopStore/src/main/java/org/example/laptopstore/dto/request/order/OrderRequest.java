package org.example.laptopstore.dto.request.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.util.enums.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    private Long userId;
    private String detailAddress;
    private String fullName;
    private String phoneNumber;
    private String email;
    private Integer wardId;
    private List<OrderProductRequest> orderProductRequestList;
    private Long discountId;
    private BigDecimal discount;
    private String note;
    private PaymentMethod paymentMethod;
}
