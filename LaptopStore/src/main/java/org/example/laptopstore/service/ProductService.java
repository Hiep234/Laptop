package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.product.create.ProductCreateRequest;
import org.example.laptopstore.dto.request.product.update.ProductUpdateRequest;
import org.example.laptopstore.dto.response.product.admin.ProductResponse;
import org.example.laptopstore.dto.response.product.list.ProductListResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionDetailUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionListUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    Page<ProductOptionListUserResponse> getAllProducts(String keyword, String categoryId, String brandId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sortBy, String sortDir);
    Page<ProductOptionListUserResponse> getProductFeature(Long userId);
    Page<ProductListResponse> adminGetAllProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sortBy, String sortDir);
    ProductResponse createProduct(ProductCreateRequest productRequest);
    ProductResponse updateProduct(Long productId, ProductUpdateRequest productRequest);
    ProductResponse getDetailAdmin(Long productId);
    ProductOptionDetailUserResponse getDetailUser(Long productOptionId);
    void deleteProduct(Long productId);
}
