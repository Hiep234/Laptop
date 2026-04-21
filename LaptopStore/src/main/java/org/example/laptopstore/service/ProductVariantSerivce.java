package org.example.laptopstore.service;

import org.example.laptopstore.entity.ProductVariant;

public interface ProductVariantSerivce {
    ProductVariant getProductVariant(Long id);

    ProductVariant save(ProductVariant productVariant);
}
