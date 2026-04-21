package org.example.laptopstore.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.category.CategoryCreateRequest;
import org.example.laptopstore.dto.request.category.CategoryUpdateRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.example.laptopstore.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

     @GetMapping("/all")
     public ApiResponse<Object> getAllCategories() {
         List<CategoryResponse> categories = categoryService.getAllCategories();
         return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(categories).build();
     }

     @GetMapping("/page")
     @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
     public ApiResponse<Object> getAllCategoriesPage(
             @RequestParam(defaultValue = "") String keyword,
             @RequestParam(defaultValue = "1") int page,
             @RequestParam(defaultValue = "10") int size,
             @RequestParam(defaultValue = "createdAt") String sortBy,
             @RequestParam(defaultValue = "desc") String sortDir) {
         Page<CategoryResponse> categories = categoryService.getCategoriesByKeyword(keyword,page - 1, size, sortBy, sortDir);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(new PageResponse<>(categories)).build();
     }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> createCategory(@Valid @ModelAttribute CategoryCreateRequest categoryRequest) {
        CategoryResponse categoryResponse = categoryService.createCategory(categoryRequest);
        return ApiResponse.builder().code(HttpStatus.CREATED.value()).message(Constant.SUCCESS_MESSAGE).data(categoryResponse).build();
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> updateCategory(
            @PathVariable Long id,
            @Valid @ModelAttribute CategoryUpdateRequest categoryRequest) {
        CategoryResponse categoryResponse = categoryService.updateCategory(id, categoryRequest);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(categoryResponse).build();
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Object> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.builder().code(HttpStatus.NO_CONTENT.value()).message(Constant.SUCCESS_MESSAGE).build();
    }
}
