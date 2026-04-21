package org.example.laptopstore.repository;

import org.example.laptopstore.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findAllByIsDeleteFalse();

    @Query("SELECT b FROM Brand b WHERE (:keyword IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) "+
            "AND b.isDelete = false AND (:countryId IS NULL OR b.country.id = :countryId)")
    Page<Brand> getAllBrand(String keyword, Long countryId, Pageable pageable);
    boolean existsByNameAndIsDeleteFalse(String name);
    boolean existsByNameAndIsDeleteFalseAndIdNot(String name, Long id);
    Optional<Brand> findByIdAndIsDeleteFalse(Long id);
}

