package org.example.laptopstore.repository;

import org.example.laptopstore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndIsDeleteFalse(Long id);

    @Query("""
        SELECT COALESCE(SUM(v.stock), 0)
        FROM ProductVariant v
        JOIN v.option o
        WHERE o.product.id = :productId AND v.isDelete = false AND o.isDelete = false
    """)
    Integer sumStockByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("UPDATE Product p SET p.isDelete = true WHERE p.brand.id = :brandId")
    void updateDeleteProductByBrandId(Long brandId);

    @Modifying
    @Query("UPDATE Product p SET p.isDelete = true WHERE p.category.id = :categoryId")
    void updateDeleteProductByCategoryId(Long categoryId);

    @Query("""
        SELECT p FROM Product p
        LEFT JOIN p.productOptions po
        WHERE p.isDelete = false
        AND (
            :keyword IS NULL OR
            LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(po.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:brandId IS NULL OR p.brand.id = :brandId)
        AND (:minPrice IS NULL OR (po.price IS NOT NULL AND po.price >= :minPrice))
        AND (:maxPrice IS NULL OR (po.price IS NOT NULL AND po.price <= :maxPrice))
        GROUP BY p
        ORDER BY
            CASE
                WHEN :sortBy = 'sales' AND :sortDir = 'asc' THEN (
                    SELECT COALESCE(SUM(oi.quantity), 0)
                    FROM OrderItem oi
                    JOIN oi.productVariant pv
                    JOIN pv.option opt
                    WHERE opt.product = p
                )
            END ASC,
            CASE
                WHEN :sortBy = 'sales' AND :sortDir = 'desc' THEN (
                    SELECT COALESCE(SUM(oi.quantity), 0)
                    FROM OrderItem oi
                    JOIN oi.productVariant pv
                    JOIN pv.option opt
                    WHERE opt.product = p
                )
            END DESC,
            CASE
                WHEN :sortBy = 'name' AND :sortDir = 'asc' THEN p.name
            END ASC,
            CASE
                WHEN :sortBy = 'name' AND :sortDir = 'desc' THEN p.name
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
                WHEN :sortBy = 'id' AND :sortDir = 'asc' THEN p.id
            END ASC,
            CASE
                WHEN :sortBy = 'id' AND :sortDir = 'desc' THEN p.id
            END DESC
    """)
    Page<Product> adminGetAllProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String sortDir, Pageable pageable);


    @Query("SELECT count(*) from Product p where p.brand.id = :id")
    Integer getProductCountByBrandId(Long id);

    @Query("SELECT count(*) from Product p where p.category.id = :id")
    Integer getProductCountByCategories(Long id);
}
