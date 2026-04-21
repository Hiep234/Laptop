package org.example.laptopstore.service;


import org.example.laptopstore.dto.request.brand.BrandCreateRequest;
import org.example.laptopstore.dto.request.brand.BrandUpdateRequest;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BrandService {

    List<BrandResponse> getAllBrands();
    BrandResponse getBrandDetail(Long id);
    Page<BrandResponse> getAllBrandsPagination(String keyword, Long countryId, int page, int size, String sortBy, String sortDir);
    BrandResponse createBrand(BrandCreateRequest brandRequest);
    BrandResponse updateBrand(Long id, BrandUpdateRequest brandRequest);
    void deleteBrand(Long id);

}
