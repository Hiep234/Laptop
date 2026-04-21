package org.example.laptopstore.dto.request.product.update;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ProductUpdateRequest {
    @NotNull(message = "Product name must not be null")
    @Size(max = 255, message = "Product name must be at most 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Category ID must not be null")
    private Long categoryId;

    @NotNull(message = "Brand ID must not be null")
    private Long brandId;

    private List<MultipartFile> imageThumbnails;

    private List<Long> imageDeleteIds;

    private List<Long> deletedOptionIds;
    @NotNull(message = "Product options must not be null")
    @Valid
    private List<ProductOptionUpdateRequest> options;
}
