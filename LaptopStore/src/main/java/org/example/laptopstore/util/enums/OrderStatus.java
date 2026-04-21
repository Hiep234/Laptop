package org.example.laptopstore.util.enums;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    CANCELLED,
    COMPLETED;

}
