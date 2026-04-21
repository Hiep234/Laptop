package org.example.laptopstore.dto.request.product.create;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class ProductVariantCreateRequest {

    @NotNull(message = "Color must not be null")
    @Size(max = 50, message = "Color must be at most 50 characters")
    private String color;

    private BigDecimal priceDiff;

    @NotNull(message = "Stock must not be null")
    private Integer stock;

    @NotNull(message = "Image must not be null")
    private MultipartFile image;
}
