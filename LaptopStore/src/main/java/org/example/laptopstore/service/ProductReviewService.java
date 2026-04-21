package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.productreview.ProductReviewRequest;
import org.example.laptopstore.dto.response.productreview.ProductReviewResponse;
import org.springframework.data.domain.Page;

import java.text.ParseException;

public interface ProductReviewService {

    Page<ProductReviewResponse> getAllProductReviewByProduct(Long productOptionId, int page, int size);
    ProductReviewResponse createProductReview(ProductReviewRequest productReviewRequest) throws ParseException;

    void deleteProductReview(Long productReviewId);
}
