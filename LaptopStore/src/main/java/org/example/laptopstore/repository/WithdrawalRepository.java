package org.example.laptopstore.repository;

import org.example.laptopstore.entity.User;
import org.example.laptopstore.entity.Withdrawal;
import org.example.laptopstore.util.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    @Query("""
        SELECT w FROM Withdrawal w
        WHERE w.user = :user
        AND (:startDate IS NULL OR w.createdAt >= :startDate)
        AND (:endDate IS NULL OR w.createdAt <= :endDate)
        AND(:status IS NULL OR w.status = :status)
    """)
    Page<Withdrawal> getAllByUser(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") WithdrawalStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT w FROM Withdrawal w
        WHERE (:startDate IS NULL OR w.createdAt >= :startDate)
        AND (:endDate IS NULL OR w.createdAt <= :endDate)
        AND (:status IS NULL OR w.status = :status)
    """)
    Page<Withdrawal> adminGetAll(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") WithdrawalStatus status,
            Pageable pageable
    );
}