package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.brand.BrandCreateRequest;
import org.example.laptopstore.dto.request.brand.BrandUpdateRequest;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.entity.Brand;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BrandMapper {

    private final ModelMapper modelMapper;

    public Brand createRequestToEntity(BrandCreateRequest request) {
        if (request == null) {
            return null;
        }
        return modelMapper.map(request, Brand.class);
    }
    public void updateRequestToEntity(Brand brand, BrandUpdateRequest request) {
        modelMapper.map(request, brand);
    }
    public BrandResponse toResponse(Brand brand) {
        if (brand == null) {
            return null;
        }
        BrandResponse brandResponse = modelMapper.map(brand, BrandResponse.class);
        brandResponse.setCountryName(brand.getCountry().getName());
        return brandResponse;
    }
}
