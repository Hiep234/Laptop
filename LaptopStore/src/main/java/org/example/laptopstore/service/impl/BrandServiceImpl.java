package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.brand.BrandCreateRequest;
import org.example.laptopstore.dto.request.brand.BrandUpdateRequest;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.entity.Brand;
import org.example.laptopstore.entity.Country;
import org.example.laptopstore.exception.ConflictException;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.mapper.BrandMapper;
import org.example.laptopstore.repository.BrandRepository;
import org.example.laptopstore.repository.CountryRepository;
import org.example.laptopstore.repository.ProductOptionRepository;
import org.example.laptopstore.repository.ProductRepository;
import org.example.laptopstore.repository.ProductVariantRepository;
import org.example.laptopstore.service.BrandService;
import org.example.laptopstore.service.ImageService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final ImageService imageService;
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final CountryRepository countryRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ModelMapper modelMapper;
    @Override
    public List<BrandResponse> getAllBrands() {
        List<Brand> list = brandRepository.findAllByIsDeleteFalse();
        List<BrandResponse> responseList = new ArrayList<>();
        for (Brand brand : list) {
            BrandResponse brandResponse = new BrandResponse();
            modelMapper.map(brand, brandResponse);
            brandResponse.setCount(productRepository.getProductCountByBrandId(brand.getId()));
            responseList.add(brandResponse);
        }
        return responseList;
    }
    @Override
    public BrandResponse getBrandDetail(Long id) {
        Brand brand = brandRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new NotFoundException("Brand not found"));
        return brandMapper.toResponse(brand);
    }

    @Override
    public Page<BrandResponse> getAllBrandsPagination(String keyword, Long countryId, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        return brandRepository.getAllBrand(keyword, countryId, pageable).map(brandMapper::toResponse);
    }

    @Override
    @Transactional
    public BrandResponse createBrand(BrandCreateRequest brandRequest) {
        if(brandRepository.existsByNameAndIsDeleteFalse(brandRequest.getName())){
            throw new ConflictException("Brand name already exists");
        }
        Country country = countryRepository.findById(brandRequest.getCountryId()).orElseThrow(()-> new NotFoundException("Country not found"));
        Brand brand = brandMapper.createRequestToEntity(brandRequest);
        brand.setCountry(country);
        if(brandRequest.getLogo() != null){
            String imageUrl = imageService.uploadImage(brandRequest.getLogo());
            brand.setLogoUrl(imageUrl);
        }
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(Long id, BrandUpdateRequest brandRequest) {
        Brand brand = brandRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new NotFoundException("Brand not found"));
        if(brandRepository.existsByNameAndIsDeleteFalseAndIdNot(brandRequest.getName(), id)){
            throw new ConflictException("Brand name already exists");
        }
        brandMapper.updateRequestToEntity(brand, brandRequest);
        if(brandRequest.getCountryId()!=null){
            Country country = countryRepository.findById(brandRequest.getCountryId()).orElseThrow(()-> new NotFoundException("Country not found"));
            brand.setCountry(country);
        }
        if(brandRequest.getLogo() != null){
            imageService.deleteImage(brand.getLogoUrl());
            String imageUrl = imageService.uploadImage(brandRequest.getLogo());
            brand.setLogoUrl(imageUrl);
        }
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new NotFoundException("Brand not found"));
        brand.setIsDelete(true);
        brandRepository.save(brand);
        productRepository.updateDeleteProductByBrandId(id);
        productOptionRepository.updateDeleteProductOptionByBrandId(id);
        productVariantRepository.updateDeleteProductVariantByBrandId(id);
    }
}
