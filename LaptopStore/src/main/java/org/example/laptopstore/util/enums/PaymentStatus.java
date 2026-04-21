package org.example.laptopstore.util.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    UNPAID,
    PAID,
    FAILED,
    REFUNDED_SUCCESSFUL,
    REFUNDED;

}
