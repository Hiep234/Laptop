package org.example.laptopstore.dto.response.product.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.laptopstore.dto.response.product.admin.ProductVariantResponse;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductOptionDetailUserResponse {

    private Long id;

    private ProductUserResponse product;

    List<ProductVariantResponse> productVariants;

    List<ProductOptionShortResponse> productOptions;

    private Long salesCount;
    private Integer totalRating;
    private Double ratingAverage;

    private String code;

    private BigDecimal price;

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
