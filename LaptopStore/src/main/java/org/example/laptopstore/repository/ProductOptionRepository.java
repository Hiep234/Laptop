package org.example.laptopstore.repository;

import org.example.laptopstore.entity.ProductOption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {

    Optional<ProductOption> findByIdAndIsDeleteFalse(Long id);

    @Modifying
    @Query(value = """
        UPDATE product_options po
        JOIN products p ON po.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        SET po.is_delete = true
        WHERE c.id = :categoryId
        """, nativeQuery = true)
    void updateDeleteProductOptionByCategoryId(@Param("categoryId") Long categoryId);

    @Modifying
    @Query(value = "UPDATE product_options po SET po.is_delete = true WHERE po.product_id = :productId", nativeQuery = true)
    void updateDeleteProductOptionByProductId(@Param("productId") Long productId);

    @Modifying
    @Query(value = """
            UPDATE product_options po
            JOIN products p ON po.product_id = p.id
            JOIN brands b ON p.brand_id = b.id
            SET po.is_delete = 1
            WHERE b.id = :brandId
        """, nativeQuery = true)
    void updateDeleteProductOptionByBrandId(@Param("brandId") Long brandId);

    @Query("""
    SELECT po FROM ProductOption po
    JOIN po.product p
    WHERE p.isDelete = false
    AND (
        :keyword IS NULL OR
        LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
        LOWER(po.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR 
        LOWER(CONCAT(p.name, ' ', po.code)) LIKE LOWER(CONCAT('%', :keyword, '%'))
    )
    AND (:categoryIds IS NULL OR p.category.id IN :categoryIds)
    AND (:brandIds IS NULL OR p.brand.id IN :brandIds)
    AND (:minPrice IS NULL OR po.price >= :minPrice)
    AND (:maxPrice IS NULL OR po.price <= :maxPrice)
    GROUP BY po
    ORDER BY
        CASE
            WHEN :sortBy = 'sales' AND :sortDir = 'asc' THEN (
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM OrderItem oi
                JOIN oi.productVariant pv
                WHERE pv.option = po
            )
        END ASC,
        CASE
            WHEN :sortBy = 'sales' AND :sortDir = 'desc' THEN (
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM OrderItem oi
                JOIN oi.productVariant pv
                WHERE pv.option = po
            )
        END DESC,
        CASE
            WHEN :sortBy = 'price' AND :sortDir = 'asc' THEN po.price
        END ASC,
        CASE
            WHEN :sortBy = 'price' AND :sortDir = 'desc' THEN po.price
        END DESC,
        CASE
            WHEN :sortBy = 'createdAt' AND :sortDir = 'asc' THEN p.createdAt
        END ASC,
        CASE
            WHEN :sortBy = 'createdAt' AND :sortDir = 'desc' THEN p.createdAt
        END DESC,
        CASE
            WHEN :sortBy = 'updatedAt' AND :sortDir = 'asc' THEN p.updatedAt
        END ASC,
        CASE
            WHEN :sortBy = 'updatedAt' AND :sortDir = 'desc' THEN p.updatedAt
        END DESC,
        CASE
            WHEN :sortBy = 'id' AND :sortDir = 'asc' THEN po.id
        END ASC,
        CASE
            WHEN :sortBy = 'id' AND :sortDir = 'desc' THEN po.id
        END DESC
""")
    Page<ProductOption> getAllProductOptions(
            @Param("keyword") String keyword,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandIds") List<Long> brandIds,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("sortBy") String sortBy,
            @Param("sortDir") String sortDir,
            Pageable pageable);
    @Query("""
    SELECT po FROM ProductOption po
    JOIN po.product p
    JOIN po.productVariants pv
    WHERE p.isDelete = false
    AND po.id IN :idProductVariant
    GROUP BY po
""")
    Page<ProductOption> getAllProductOptions(
            Pageable pageable,
            @Param("idProductVariant") List<Long> idProductVariant);

}
