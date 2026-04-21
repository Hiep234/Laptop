package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.productreview.ProductReviewRequest;
import org.example.laptopstore.dto.response.productreview.ProductReviewResponse;
import org.example.laptopstore.dto.response.user.UserResponse;
import org.example.laptopstore.entity.ProductReview;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductReviewMapper {
    private final ModelMapper modelMapper;

    public ProductReview mapRequestToEntity(ProductReviewRequest productReview) {
        if (productReview == null) {
            return null;
        }
        return modelMapper.map(productReview, ProductReview.class);
    }

    public ProductReviewResponse toProductReviewResponse(ProductReview productReview) {
        if (productReview == null) {
            return null;
        }
        ProductReviewResponse productReviewResponse = modelMapper.map(productReview, ProductReviewResponse.class);
        UserResponse userResponse = modelMapper.map(productReview.getUser(), UserResponse.class);
        productReviewResponse.setUser(userResponse);
        return productReviewResponse;
    }
}
