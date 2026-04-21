package org.example.laptopstore.repository;

import org.example.laptopstore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Modifying
    @Query(value = """
        UPDATE product_variants pv
        JOIN product_options po ON pv.option_id = po.id
        JOIN products p ON po.product_id = p.id
        SET pv.is_delete = true
        WHERE p.id = :productId
    """, nativeQuery = true)
    void updateDeleteProductVariantByProductId(@Param("productId") Long productId);

    @Modifying
    @Query(value = """
        UPDATE product_variants pv
        JOIN product_options po ON pv.option_id = po.id
        JOIN products p ON po.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        SET pv.is_delete = true
        WHERE c.id = :categoryId
    """, nativeQuery = true)
    void updateDeleteProductVariantByCategoryId(@Param("categoryId") Long categoryId);

    @Modifying
    @Query(value = """
        UPDATE product_variants pv
        JOIN product_options po ON pv.option_id = po.id
        JOIN products p ON po.product_id = p.id
        JOIN brands b ON p.brand_id = b.id
        SET pv.is_delete = 1
        WHERE b.id = :brandId
    """, nativeQuery = true)
    void updateDeleteProductVariantByBrandId(@Param("brandId") Long brandId);

    @Modifying
    @Query(value = """
        UPDATE product_variants pv
        JOIN product_options po ON pv.option_id = po.id
        SET pv.is_delete = true
        WHERE po.id = :productOptionId
    """, nativeQuery = true)
    void updateDeleteProductVariantByProductOptionId(Long productOptionId);
}
