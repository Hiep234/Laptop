package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.product.admin.ProductVariantResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionDetailUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionShortResponse;
import org.example.laptopstore.dto.response.product.user.ProductUserResponse;
import org.example.laptopstore.entity.ProductOption;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductOptionMapper {

    private final ModelMapper modelMapper;
    private final ProductMapper productMapper;

    public ProductOptionDetailUserResponse productOptionDetailUserResponse(ProductOption productOption) {
        if (productOption == null) {
            return null;
        }
        ProductOptionDetailUserResponse productOptionDetailUserResponse = modelMapper.map(productOption, ProductOptionDetailUserResponse.class);
        ProductUserResponse productUserResponses = productMapper.toProductUserDetail(productOption.getProduct());
        productOptionDetailUserResponse.setProduct(productUserResponses);
        if (productOption.getProductVariants() != null && !productOption.getProductVariants().isEmpty()) {
            List<ProductVariantResponse> productVariantResponses = productOption.getProductVariants().stream().filter(variant -> !variant.getIsDelete()).map(variant -> modelMapper.map(variant, ProductVariantResponse.class)).toList();
            productOptionDetailUserResponse.setProductVariants(productVariantResponses);
        }
        if(productOption.getProduct().getProductOptions() != null && !productOption.getProduct().getProductOptions().isEmpty()){
            List<ProductOptionShortResponse> productOptionShortResponses = productOption.getProduct().getProductOptions().stream().filter(option -> !option.getIsDelete()).map(option -> modelMapper.map(option, ProductOptionShortResponse.class)).toList();
            productOptionDetailUserResponse.setProductOptions(productOptionShortResponses);
        }
        return productOptionDetailUserResponse;
    }
}
