package org.example.laptopstore.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.brand.BrandCreateRequest;
import org.example.laptopstore.dto.request.brand.BrandUpdateRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.service.BrandService;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/brands")
public class BrandController {
    private final BrandService brandService;

    @GetMapping("/all")
    public ApiResponse<Object> getAllBrands() {
        List<BrandResponse> brandResponses = brandService.getAllBrands();
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(brandResponses).build();
    }

    @GetMapping("/page")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> getAllBrandsPagination(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long countryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<BrandResponse> brandResponses = brandService.getAllBrandsPagination(keyword, countryId,page - 1, size, sortBy, sortDir);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(new PageResponse<>(brandResponses)).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getBrandDetail(@PathVariable Long id) {
        BrandResponse brandResponse = brandService.getBrandDetail(id);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(brandResponse).build();
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> createBrand(@Valid @ModelAttribute BrandCreateRequest brandCreateRequest) {
        BrandResponse brandResponse = brandService.createBrand(brandCreateRequest);
        return ApiResponse.builder().code(HttpStatus.CREATED.value()).message(Constant.SUCCESS_MESSAGE).data(brandResponse).build();
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> updateBrand(
            @PathVariable Long id,
            @Valid @ModelAttribute BrandUpdateRequest brandUpdateRequest) {
        BrandResponse brandResponse = brandService.updateBrand(id, brandUpdateRequest);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(brandResponse).build();
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ApiResponse.builder().code(HttpStatus.NO_CONTENT.value()).message(Constant.SUCCESS_MESSAGE).build();
    }
}
