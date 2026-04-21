package org.example.laptopstore.service.impl;

import lombok.Data;
import org.example.laptopstore.entity.ProductVariant;
import org.example.laptopstore.repository.ProductVariantRepository;
import org.example.laptopstore.service.ProductVariantSerivce;
import org.springframework.stereotype.Service;

@Data
@Service
public class ProductVariantServiceImpl implements ProductVariantSerivce {
    private final ProductVariantRepository repository;
    @Override
    public ProductVariant getProductVariant(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ProductVariant save(ProductVariant productVariant) {
        return repository.save(productVariant);
    }
}
