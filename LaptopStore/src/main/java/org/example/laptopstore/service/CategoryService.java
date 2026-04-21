package org.example.laptopstore.service;

import org.example.laptopstore.dto.request.category.CategoryCreateRequest;
import org.example.laptopstore.dto.request.category.CategoryUpdateRequest;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();
    Page<CategoryResponse> getCategoriesByKeyword(String keyword, int page, int size, String sortBy, String sortDir);
    CategoryResponse createCategory(CategoryCreateRequest categoryRequest);
    CategoryResponse updateCategory(Long id, CategoryUpdateRequest categoryRequest);
    void deleteCategory(Long id);

}
