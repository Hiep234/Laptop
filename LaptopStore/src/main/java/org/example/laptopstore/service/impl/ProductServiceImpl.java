package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.product.create.ProductCreateRequest;
import org.example.laptopstore.dto.request.product.update.ProductUpdateRequest;
import org.example.laptopstore.dto.response.RecommendationResponse;
import org.example.laptopstore.dto.response.product.admin.ProductResponse;
import org.example.laptopstore.dto.response.product.list.ProductListResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionDetailUserResponse;
import org.example.laptopstore.dto.response.product.user.ProductOptionListUserResponse;
import org.example.laptopstore.entity.Brand;
import org.example.laptopstore.entity.Category;
import org.example.laptopstore.entity.ImageThumbnail;
import org.example.laptopstore.entity.Product;
import org.example.laptopstore.entity.ProductOption;
import org.example.laptopstore.entity.ProductVariant;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.mapper.ProductMapper;
import org.example.laptopstore.mapper.ProductOptionMapper;
import org.example.laptopstore.repository.BrandRepository;
import org.example.laptopstore.repository.CategoryRepository;
import org.example.laptopstore.repository.ImageThumbnailRepository;
import org.example.laptopstore.repository.OrderItemsRepository;
import org.example.laptopstore.repository.ProductOptionRepository;
import org.example.laptopstore.repository.ProductRepository;
import org.example.laptopstore.repository.ProductReviewRepository;
import org.example.laptopstore.repository.ProductVariantRepository;
import org.example.laptopstore.service.ImageService;
import org.example.laptopstore.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final ImageService imageService;
    private final ProductOptionRepository productOptionRepository;
    private final ImageThumbnailRepository imageThumbnailRepository;
    private final ProductMapper productMapper;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductOptionMapper productOptionMapper;
    private final OrderItemsRepository orderItemsRepository;
    private final ProductReviewRepository productReviewRepository;

    @Override
    public Page<ProductOptionListUserResponse> getAllProducts(String keyword, String categoryId, String brandId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size);
        List<Long> categoryIds = convertStringToList(categoryId);
        List<Long> brandIds = convertStringToList(brandId);
        Page<ProductOption> productOptions = productOptionRepository.getAllProductOptions(keyword, categoryIds, brandIds, minPrice, maxPrice, sortBy, sortDir, pageable);
        return productOptions.map(productOption -> productMapper.toProductListUserResponse(productOption, productReviewRepository.ratingAverageProductOption(productOption.getId()), orderItemsRepository.countProductOptionSold(productOption.getId())));
    }
    private List<Long> convertStringToList(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        return Arrays.stream(input.split(","))
                .map(Long::parseLong)
                .toList();
    }
    @Override
    public Page<ProductListResponse> adminGetAllProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.adminGetAllProducts(keyword, categoryId, brandId, minPrice, maxPrice, sortBy, sortDir, pageable);
        return products.map(product -> productMapper.toProductListAdminResponse(product, productReviewRepository.ratingAverageProduct(product.getId()), orderItemsRepository.countProductSold(product.getId()), productRepository.sumStockByProductId(product.getId())));
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest productRequest) {
        Brand brand = brandRepository.findByIdAndIsDeleteFalse(productRequest.getBrandId()).orElseThrow(() -> new NotFoundException("Brand not found"));
        Category category = categoryRepository.findByIdAndIsDeleteFalse(productRequest.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found"));
        Product product = modelMapper.map(productRequest, Product.class);
        product.setBrand(brand);
        product.setCategory(category);
        Product productSave = productRepository.save(product);

        if(!productRequest.getImageThumbnails().isEmpty()){
            List<ImageThumbnail> imageThumbnails =  uploadImageProduct(productSave, productRequest.getImageThumbnails());
            List<ImageThumbnail> imageThumbnailList = imageThumbnailRepository.saveAll(imageThumbnails);
            productSave.setImages(imageThumbnailList);
        }

        List<ProductOption> productOptions = productRequest.getOptions().stream().map(optionRequest -> {
            ProductOption productOption = modelMapper.map(optionRequest, ProductOption.class);
            productOption.setProduct(product);
            List<ProductVariant> productVariants = optionRequest.getVariants().stream().map(variantRequest -> {
                ProductVariant productVariant = modelMapper.map(variantRequest, ProductVariant.class);
                if(variantRequest.getImage() != null){
                    String url = imageService.uploadImage(variantRequest.getImage());
                    productVariant.setImageUrl(url);
                }
                productVariant.setOption(productOption);
                return productVariant;
            }).toList();
            productOption.setProductVariants(productVariants);
            return productOption;
        }).toList();
        List<ProductOption> productOptionsSave = productOptionRepository.saveAll(productOptions);
        productSave.setProductOptions(productOptionsSave);
        return productMapper.toResponse(productSave, false);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, ProductUpdateRequest productRequest) {
        Product product = productRepository.findByIdAndIsDeleteFalse(productId).orElseThrow(() -> new NotFoundException("Product not found"));
        modelMapper.map(productRequest, product);
        if(!product.getBrand().getId().equals(productRequest.getBrandId())){
            Brand brand = brandRepository.findByIdAndIsDeleteFalse(productRequest.getBrandId()).orElseThrow(() -> new NotFoundException("Brand not found"));
            product.setBrand(brand);
        }
        if(!product.getCategory().getId().equals(productRequest.getCategoryId())){
            Category category = categoryRepository.findByIdAndIsDeleteFalse(productRequest.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }
        if(productRequest.getImageThumbnails() != null && !productRequest.getImageThumbnails().isEmpty()){
            List<ImageThumbnail> imageThumbnails = uploadImageProduct(product, productRequest.getImageThumbnails());
            imageThumbnailRepository.saveAll(imageThumbnails);
        }
        if(productRequest.getImageDeleteIds() != null && !productRequest.getImageDeleteIds().isEmpty()){
            List<ImageThumbnail> imageThumbnails = imageThumbnailRepository.findAllById(productRequest.getImageDeleteIds());
            imageThumbnails.forEach(imageThumbnail -> {
                imageService.deleteImage(imageThumbnail.getUrl());
                imageThumbnailRepository.delete(imageThumbnail);
            });
        }
        if(productRequest.getDeletedOptionIds() != null && !productRequest.getDeletedOptionIds().isEmpty()){
            List<ProductOption> productOptions = productOptionRepository.findAllById(productRequest.getDeletedOptionIds());
            productOptions.forEach(productOption -> {
                productOption.setIsDelete(true);
                productOptionRepository.save(productOption);
                productVariantRepository.updateDeleteProductVariantByProductOptionId(productOption.getId());
            });
        }
        if(productRequest.getOptions() != null && !productRequest.getOptions().isEmpty()){
            List<ProductOption> productOptions = new ArrayList<>();
            productRequest.getOptions().forEach(optionRequest -> {
                ProductOption productOption;
                if(optionRequest.getId() != null){
                    productOption = productOptionRepository.findById(optionRequest.getId()).orElseThrow(() -> new NotFoundException("Product option not found"));
                }else{
                    productOption = new ProductOption();
                    productOption.setProduct(product);
                }
                modelMapper.map(optionRequest, productOption);
                List<ProductVariant> productVariants = new ArrayList<>();
                optionRequest.getVariants().forEach(variantRequest -> {
                    ProductVariant productVariant;
                    if(variantRequest.getId() != null){
                        productVariant = productVariantRepository.findById(variantRequest.getId()).orElseThrow(() -> new NotFoundException("Product variant not found"));
                    }else {
                        productVariant = new ProductVariant();
                        productVariant.setOption(productOption);
                    }
                    modelMapper.map(variantRequest, productVariant);
                    if(variantRequest.getImage() != null){
                        String url = imageService.uploadImage(variantRequest.getImage());
                        productVariant.setImageUrl(url);
                    }
                    productVariants.add(productVariant);
                });
                if(optionRequest.getDeletedVariantIds() != null && !optionRequest.getDeletedVariantIds().isEmpty()){
                    List<ProductVariant> productVariantsDelete = productVariantRepository.findAllById(optionRequest.getDeletedVariantIds());
                    productVariantsDelete.forEach(productVariant -> {
                        productVariant.setIsDelete(true);
                        productVariantRepository.save(productVariant);
                    });
                }
                productOption.setProductVariants(productVariants);
                productOptions.add(productOption);
            });

            product.setProductOptions(productOptions);
        }
        Product productSave = productRepository.save(product);
        return productMapper.toResponse(productSave, false);
    }

    private List<ImageThumbnail> uploadImageProduct(Product product, List<MultipartFile> listImageThumbnail) {
        List<ImageThumbnail> imageThumbnails = new ArrayList<>();
        listImageThumbnail.forEach(imageRequest -> {
            String url = imageService.uploadImage(imageRequest);
            ImageThumbnail imageThumbnail = new ImageThumbnail();
            imageThumbnail.setUrl(url);
            imageThumbnail.setProduct(product);
            imageThumbnails.add(imageThumbnail);
        });
        return imageThumbnails;
    }

    @Override
    public ProductResponse getDetailAdmin(Long productId) {
        Product product = productRepository.findByIdAndIsDeleteFalse(productId).orElseThrow(() -> new NotFoundException("Product not found"));
        return productMapper.toResponse(product, true);
    }

    @Override
    public ProductOptionDetailUserResponse getDetailUser(Long productOptionId) {
        ProductOption productOption = productOptionRepository.findByIdAndIsDeleteFalse(productOptionId).orElseThrow(() -> new NotFoundException("Product option not found"));
        if(productOption.getProduct().getIsDelete()){
            throw new NotFoundException("Product not found");
        }
        ProductOptionDetailUserResponse productOptionDetailUserResponse = productOptionMapper.productOptionDetailUserResponse(productOption);
        productOptionDetailUserResponse.setSalesCount(orderItemsRepository.countProductOptionSold(productOption.getProduct().getId()));
        productOptionDetailUserResponse.setTotalRating(productReviewRepository.countTotal(productOptionId));
        productOptionDetailUserResponse.setRatingAverage(productReviewRepository.ratingAverageProductOption(productOptionId));
        return productOptionDetailUserResponse;
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findByIdAndIsDeleteFalse(productId).orElseThrow(() -> new NotFoundException("Product not found"));
        product.setIsDelete(true);
        productRepository.save(product);
        productOptionRepository.updateDeleteProductOptionByProductId(productId);
        productVariantRepository.updateDeleteProductVariantByProductId(productId);
    }

    @Override
    public Page<ProductOptionListUserResponse> getProductFeature(Long userId) {
        Pageable pageable = PageRequest.of(0,5);
        List<Long> listIdProduct = getRecommendations(userId).getRecommended_product_option_ids();

        Page<ProductOption> productOptions = productOptionRepository.getAllProductOptions(pageable,listIdProduct);

        return productOptions.map(productOption -> productMapper.toProductListUserResponse(productOption, productReviewRepository.ratingAverageProductOption(productOption.getId()), orderItemsRepository.countProductOptionSold(productOption.getId())));
    }
    public RecommendationResponse getRecommendations(Long userId) {
        String url = "http://localhost:5000/api/recommendations?user_id=" + userId;

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<RecommendationResponse> response = restTemplate.getForEntity(url, RecommendationResponse.class);

        return response.getBody();
    }
}
