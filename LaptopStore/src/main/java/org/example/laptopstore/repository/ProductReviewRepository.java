package org.example.laptopstore.repository;

import org.example.laptopstore.entity.ProductOption;
import org.example.laptopstore.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findAllByProductOption(ProductOption productOption, Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.rating), 5) FROM ProductReview r WHERE r.productOption.id = :productOptionId")
    double ratingAverageProductOption(Long productOptionId);

    @Query("SELECT COALESCE(AVG(r.rating), 5) FROM ProductReview r WHERE r.productOption.product.id = :product")
    double ratingAverageProduct(Long product);

    @Query("Select count(*) from ProductReview  pr where  pr.productOption.id = :id")
    Integer countTotal(@Param("id")Long id);

}
