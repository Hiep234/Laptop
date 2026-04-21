package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.category.CategoryCreateRequest;
import org.example.laptopstore.dto.request.category.CategoryUpdateRequest;
import org.example.laptopstore.dto.response.brand.BrandResponse;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.example.laptopstore.entity.Brand;
import org.example.laptopstore.entity.Category;
import org.example.laptopstore.exception.ConflictException;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.repository.CategoryRepository;
import org.example.laptopstore.repository.ProductOptionRepository;
import org.example.laptopstore.repository.ProductRepository;
import org.example.laptopstore.repository.ProductVariantRepository;
import org.example.laptopstore.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    private final ImageService imageService;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        List<Category> list = categoryRepository.findAllByIsDeleteFalse();
        List<CategoryResponse> responseList = new ArrayList<>();
        for (Category category : list) {
            CategoryResponse categoryResponse = new CategoryResponse();
            modelMapper.map(category, categoryResponse);
            categoryResponse.setCount(productRepository.getProductCountByCategories(category.getId()));
            responseList.add(categoryResponse);
        }
        return responseList;
    }

    @Override
    public Page<CategoryResponse> getCategoriesByKeyword(String keyword, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        return categoryRepository.findAllByNameContainingIgnoreCaseAndIsDeleteFalse(keyword, pageable)
                .map(category -> modelMapper.map(category, CategoryResponse.class));
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest categoryRequest) {
        if(categoryRepository.existsByNameAndIsDeleteFalse(categoryRequest.getName())){
            throw new ConflictException("Category name already exists");
        }
        Category category = modelMapper.map(categoryRequest, Category.class);
        if(categoryRequest.getImage() != null){
            String imageUrl = imageService.uploadImage(categoryRequest.getImage());
            category.setImageUrl(imageUrl);
        }
        return modelMapper.map(categoryRepository.save(category), CategoryResponse.class);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest categoryRequest) {
        Category category = categoryRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        if(categoryRepository.existsByNameAndIsDeleteFalseAndIdNot(categoryRequest.getName(), id)){
            throw new ConflictException("Category name already exists");
        }
        category.setName(categoryRequest.getName());
        if(categoryRequest.getImage() != null){
            imageService.deleteImage(category.getImageUrl());
            String imageUrl = imageService.uploadImage(categoryRequest.getImage());
            category.setImageUrl(imageUrl);

        }
        return modelMapper.map(categoryRepository.save(category), CategoryResponse.class);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findByIdAndIsDeleteFalse(id).orElseThrow(() -> new NotFoundException("Category not found"));
        category.setIsDelete(true);
        categoryRepository.save(category);
        productRepository.updateDeleteProductByCategoryId(id);
        productOptionRepository.updateDeleteProductOptionByCategoryId(id);
        productVariantRepository.updateDeleteProductVariantByCategoryId(id);
    }
}
