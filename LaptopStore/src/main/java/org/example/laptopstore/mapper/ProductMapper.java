package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.category.CategoryResponse;
import org.example.laptopstore.dto.response.image.ImageThumbnailResponse;
import org.example.laptopstore.dto.response.product.admin.ProductOptionResponse;
import org.example.laptopstore.dto.response.product.admin.ProductResponse;
import org.example.laptopstore.dto.response.product.admin.ProductVariantResponse;
import org.example.laptopstore.dto.response.product.list.ProductListResponse;
import org.example.laptopstore.dto.response.product.list.ProductOptionListResponse;
import org.example.laptopstore.dto.response.product.user.ProductListUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionListUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductUserResponse;
import org.example.laptopstore.entity.Product;
import org.example.laptopstore.entity.ProductOption;
import org.example.laptopstore.repository.OrderItemsRepository;
import org.example.laptopstore.repository.ProductReviewRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final ModelMapper modelMapper;
    private final BrandMapper brandMapper;
    private final OrderItemsRepository orderItemsRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductResponse toResponse(Product product, boolean isDetail) {
        if (product == null) {
            return null;
        }
        ProductResponse productResponse = modelMapper.map(product, ProductResponse.class);
        productResponse.setBrand(brandMapper.toResponse(product.getBrand()));
        if(isDetail){
            long productSalesCount = orderItemsRepository.countProductSold(product.getId());
            double productAverageRating = productReviewRepository.ratingAverageProduct(product.getId());
            productResponse.setSalesCount(productSalesCount);
            productResponse.setRatingAverage(productAverageRating);
        }
        if(product.getProductOptions()!= null && !product.getProductOptions().isEmpty()){
            productResponse.setOptions(product.getProductOptions().stream().filter(option -> !option.getIsDelete()).map(option -> {
                ProductOptionResponse productOptionResponse = modelMapper.map(option, ProductOptionResponse.class);
                if(isDetail){
                    long productOptionSalesCount = orderItemsRepository.countProductOptionSold(option.getId());
                    double productOptionAverageRating = productReviewRepository.ratingAverageProductOption(option.getId());
                    productOptionResponse.setSalesCount(productOptionSalesCount);
                    productOptionResponse.setRatingAverage(productOptionAverageRating);
                }
                if(productOptionResponse.getProductVariants() != null && !productOptionResponse.getProductVariants().isEmpty()){
                    List<ProductVariantResponse> productVariantResponses = option.getProductVariants().stream().filter(variant -> !variant.getIsDelete()).map(variant -> {
                        ProductVariantResponse productVariantResponse = modelMapper.map(variant, ProductVariantResponse.class);
                        if(isDetail){
                            long productVariantSalesCount = orderItemsRepository.countProductVariantSold(variant.getId());
                            productVariantResponse.setSalesCount(productVariantSalesCount);
                        }
                        return productVariantResponse;
                    }).toList();
                    productOptionResponse.setProductVariants(productVariantResponses);
                }
                return productOptionResponse;
            }).toList());
        }
        productResponse.setCategory(modelMapper.map(product.getCategory(), CategoryResponse.class));
        List<ImageThumbnailResponse> imageThumbnailResponses = product.getImages().stream().map(image -> modelMapper.map(image, ImageThumbnailResponse.class)).toList();
        productResponse.setImages(imageThumbnailResponses);
        return productResponse;
    }

    public ProductUserResponse toProductUserDetail(Product product) {
        if (product == null) {
            return null;
        }
        ProductUserResponse productUserResponse = modelMapper.map(product, ProductUserResponse.class);
        productUserResponse.setBrand(brandMapper.toResponse(product.getBrand()));
        productUserResponse.setCategory(modelMapper.map(product.getCategory(), CategoryResponse.class));
        List<ImageThumbnailResponse> imageThumbnailResponses = product.getImages().stream().map(image -> modelMapper.map(image, ImageThumbnailResponse.class)).toList();
        productUserResponse.setImages(imageThumbnailResponses);
        return productUserResponse;
    }

    public ProductOptionListUserResponse toProductListUserResponse(ProductOption productOption, double averageRating, long salesCount) {
        if (productOption == null) {
            return null;
        }
        ProductOptionListUserResponse productOptionListUserResponse = modelMapper.map(productOption, ProductOptionListUserResponse.class);
        ProductListUserResponse productListResponse = modelMapper.map(productOption.getProduct(), ProductListUserResponse.class);
        productListResponse.setBrand(brandMapper.toResponse(productOption.getProduct().getBrand()));
        productListResponse.setCategory(modelMapper.map(productOption.getProduct().getCategory(), CategoryResponse.class));
        productOptionListUserResponse.setProduct(productListResponse);
        productOptionListUserResponse.setSalesCount(salesCount);
        productOptionListUserResponse.setRatingAverage(averageRating);
        ProductVariantResponse productVariantResponse = modelMapper.map(productOption.getProductVariants().stream().filter(productVariant -> !productVariant.getIsDelete()).findFirst().orElse(null), ProductVariantResponse.class);
        productOptionListUserResponse.setProductVariant(productVariantResponse);
        return productOptionListUserResponse;
    }

    public ProductListResponse toProductListAdminResponse(Product product, double averageRating, long salesCount, long stock) {
        if (product == null) {
            return null;
        }
        ProductListResponse productListResponse = modelMapper.map(product, ProductListResponse.class);
        productListResponse.setBrand(brandMapper.toResponse(product.getBrand()));
        productListResponse.setSalesCount(salesCount);
        productListResponse.setRatingAverage(averageRating);
        productListResponse.setStock(stock);
        productListResponse.setCategory(modelMapper.map(product.getCategory(), CategoryResponse.class));
        List<ImageThumbnailResponse> imageThumbnailResponses = product.getImages().stream().map(image -> modelMapper.map(image, ImageThumbnailResponse.class)).toList();
        productListResponse.setImages(imageThumbnailResponses);
        return productListResponse;
    }

}
