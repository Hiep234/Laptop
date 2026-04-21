package org.example.laptopstore.repository;

import org.example.laptopstore.entity.Discount;
import org.example.laptopstore.entity.Product;
import org.example.laptopstore.util.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long>{

    @Query("SELECT d FROM Discount d WHERE d.isDelete = false AND " +
            "(:keyword IS NULL OR LOWER(d.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:discountType IS NULL OR d.discountType = :discountType) " +
            "AND (:isActive IS NULL OR d.isActive = :isActive) " +
            "AND (:startDate IS NULL OR d.endDate >= :startDate) " +
            "AND (:endDate IS NULL OR d.startDate <= :endDate)"
    )
    Page<Discount> getAllDiscountPagination(String keyword, DiscountType discountType, Boolean isActive, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Optional<Discount> findByIdAndIsDeleteFalse(Long id);

    boolean existsByCodeAndIsDeleteFalse(String code);
    boolean existsByCodeAndIsDeleteFalseAndIdNot(String code, Long id);

    Discount findDiscountByCode(String code);
}
