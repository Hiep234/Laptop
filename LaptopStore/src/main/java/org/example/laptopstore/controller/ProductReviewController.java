package org.example.laptopstore.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.productreview.ProductReviewRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.productreview.ProductReviewResponse;
import org.example.laptopstore.service.ProductReviewService;
import org.example.laptopstore.util.Constant;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product-reviews")
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    @GetMapping("/{productOptionId}")
    public ApiResponse<Object> getAllProductReviewsByProductId(
            @PathVariable Long productOptionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Page<ProductReviewResponse> productReviewResponsePage = productReviewService.getAllProductReviewByProduct(productOptionId, page - 1, size);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(new PageResponse<>(productReviewResponsePage)).build();
    }

    @PostMapping("/create")
    public ApiResponse<Object> createProductReview(@Valid @RequestBody ProductReviewRequest productReviewRequest) throws ParseException {
        ProductReviewResponse productReviewResponse = productReviewService.createProductReview(productReviewRequest);
        return ApiResponse.builder().code(HttpStatus.CREATED.value()).message(Constant.SUCCESS_MESSAGE).data(productReviewResponse).build();
    }

    @DeleteMapping("/delete/{productReviewId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> deleteProductReview(@PathVariable Long productReviewId){
        productReviewService.deleteProductReview(productReviewId);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).build();
    }
}
