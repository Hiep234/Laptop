package org.example.laptopstore.dto.request.product.create;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductOptionCreateRequest {

    @NotNull(message = "Option code must not be null")
    @Size(max = 50, message = "Option code must be at most 50 characters")
    private String code;

    @NotNull(message = "Option price must not be null")
    private BigDecimal price;

    @NotNull(message = "Product variants must not be null")
    @Valid
    List<ProductVariantCreateRequest> variants;

    private String cpu;
    private String gpu;
    private String ram;
    private String ramType;
    private String ramSlot;
    private String storage;
    private String storageUpgrade;
    private String displaySize;
    private String displayResolution;
    private String displayRefreshRate;
    private String displayTechnology;
    private String audioFeatures;
    private String keyboard;
    private String security;
    private String webcam;
    private String operatingSystem;
    private String battery;
    private String weight;
    private String dimension;
    private String wifi;
    private String bluetooth;
    private String ports;
    private String specialFeatures;
}
