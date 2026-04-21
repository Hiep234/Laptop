package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.productreview.ProductReviewRequest;
import org.example.laptopstore.dto.response.productreview.ProductReviewResponse;
import org.example.laptopstore.entity.ProductOption;
import org.example.laptopstore.entity.ProductReview;
import org.example.laptopstore.entity.User;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.mapper.ProductReviewMapper;
import org.example.laptopstore.repository.ProductOptionRepository;
import org.example.laptopstore.repository.ProductReviewRepository;
import org.example.laptopstore.repository.UserRepository;
import org.example.laptopstore.service.ProductReviewService;
import org.example.laptopstore.service.TokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;

import static org.example.laptopstore.util.Constant.SUB;
import static org.example.laptopstore.util.Constant.USER_NOT_VALID;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductOptionRepository productOptionRepository;
    private final ProductReviewRepository productReviewRepository;
    private final ProductReviewMapper productReviewMapper;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    public Page<ProductReviewResponse> getAllProductReviewByProduct(Long productOptionId, int page, int size) {
        ProductOption productOption = productOptionRepository.findByIdAndIsDeleteFalse(productOptionId).orElseThrow(() -> new NotFoundException("Product not found"));
        Page<ProductReview> productReviews = productReviewRepository.findAllByProductOption(productOption, PageRequest.of(page, size));
        return productReviews.map(productReviewMapper::toProductReviewResponse);
    }

    @Override
    @Transactional
    public ProductReviewResponse createProductReview(ProductReviewRequest productReviewRequest) throws ParseException {
        String token = tokenService.getJWT();
        String username = tokenService.getClaim(token, SUB);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotFoundException(USER_NOT_VALID);
        }

        ProductOption productOption = productOptionRepository.findByIdAndIsDeleteFalse(productReviewRequest.getProductOptionId())
                .orElseThrow(() -> new NotFoundException("Product not found"));
        ProductReview productReview = productReviewMapper.mapRequestToEntity(productReviewRequest);
        productReview.setProductOption(productOption);
        productReview.setUser(user);
        return productReviewMapper.toProductReviewResponse(productReviewRepository.save(productReview)) ;
    }

    @Override
    @Transactional
    public void deleteProductReview(Long productReviewId) {
        ProductReview productReview = productReviewRepository.findById(productReviewId)
                .orElseThrow(() -> new NotFoundException("Product review not found"));
        productReviewRepository.delete(productReview);
    }
}
