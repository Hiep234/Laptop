package org.example.laptopstore.repository;

import org.example.laptopstore.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByIsDeleteFalse();
    Page<Category> findAllByNameContainingIgnoreCaseAndIsDeleteFalse(String keyword, Pageable pageable);
    Optional<Category> findByIdAndIsDeleteFalse(Long id);
    boolean existsByNameAndIsDeleteFalse(String name);
    boolean existsByNameAndIsDeleteFalseAndIdNot(String name, Long id);
}
