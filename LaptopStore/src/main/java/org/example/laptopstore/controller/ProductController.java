package org.example.laptopstore.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.product.create.ProductCreateRequest;
import org.example.laptopstore.dto.request.product.update.ProductUpdateRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.product.admin.ProductResponse;
import org.example.laptopstore.dto.response.product.list.ProductListResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionDetailUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionListUserResponse;
import org.example.laptopstore.service.ProductService;
import org.example.laptopstore.util.Constant;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/page")
    public ApiResponse<Object> getAllProducts(@RequestParam(defaultValue = "") String keyword,
                                              @RequestParam(required = false) String categoryId,
                                              @RequestParam(required = false) String brandId,
                                              @RequestParam(required = false) BigDecimal minPrice,
                                              @RequestParam(required = false) BigDecimal maxPrice,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size,
                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                              @RequestParam(defaultValue = "asc") String sortDir) {
        Page<ProductOptionListUserResponse> productListResponse = productService.getAllProducts(keyword, categoryId, brandId, minPrice, maxPrice, page - 1, size, sortBy, sortDir);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(new PageResponse<>(productListResponse))
                .build();
    }
    @GetMapping("/feature")
    public ApiResponse<Object> getAllProductsFeature(@RequestParam(required = false) Long userId) {
        Page<ProductOptionListUserResponse> productListResponse = productService.getProductFeature(userId);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(new PageResponse<>(productListResponse))
                .build();
    }
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> adminGetAllProducts(@RequestParam(defaultValue = "") String keyword,
                                              @RequestParam(required = false) Long categoryId,
                                              @RequestParam(required = false) Long brandId,
                                              @RequestParam(required = false) BigDecimal minPrice,
                                              @RequestParam(required = false) BigDecimal maxPrice,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size,
                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                              @RequestParam(defaultValue = "desc") String sortDir) {
        Page<ProductListResponse> productListResponse = productService.adminGetAllProducts(keyword, categoryId, brandId, minPrice, maxPrice, page-1, size, sortBy, sortDir);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(new PageResponse<>(productListResponse))
                .build();
    }
    @GetMapping("/detail/{productOptionId}")
    public ApiResponse<Object> getProductOptionDetail(@PathVariable("productOptionId") Long productOptionId) {
        ProductOptionDetailUserResponse productResponse = productService.getDetailUser(productOptionId);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(productResponse)
                .build();
    }

    @GetMapping("/admin/detail/{productId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> getDetailProductAdmin(@PathVariable("productId") Long productId) {
        ProductResponse productResponse = productService.getDetailAdmin(productId);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(productResponse)
                .build();
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> createProduct(@Valid @ModelAttribute ProductCreateRequest productCreateRequest) {
        ProductResponse productResponse = productService.createProduct(productCreateRequest);
        return ApiResponse.builder()
                .code(HttpStatus.CREATED.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(productResponse)
                .build();
    }

    @PutMapping(value = "/update/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> updateProduct(@PathVariable("productId") Long productId,  @Valid @ModelAttribute ProductUpdateRequest productUpdateRequest) {
        ProductResponse productResponse = productService.updateProduct(productId, productUpdateRequest);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(productResponse)
                .build();
    }

    @DeleteMapping("/delete/{productId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> deleteProduct(@PathVariable("productId") Long productId) {
        productService.deleteProduct(productId);
        return ApiResponse.builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message(Constant.SUCCESS_MESSAGE)
                .build();
    }
}
