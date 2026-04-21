package org.example.laptopstore.repository;

import org.example.laptopstore.dto.response.order.RevenueMonth;
import org.example.laptopstore.dto.response.order.RevenueYear;
import org.example.laptopstore.entity.Order;
import org.example.laptopstore.util.enums.OrderStatus;
import org.example.laptopstore.util.enums.PaymentMethod;
import org.example.laptopstore.util.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = :paymentStatus AND o.paymentMethod = :paymentMethod AND o.createdAt < :threshold")
    List<Order> findOrderStatus(@Param("paymentStatus") PaymentStatus paymentStatus,
                                @Param("paymentMethod") PaymentMethod paymentMethod,
                                @Param("threshold") LocalDateTime threshold);
    @Query("SELECT o FROM Order o WHERE" +
            "(:userId IS NULL OR o.user.id = :userId) AND " +
            "(:status IS NULL OR o.status = :status) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'asc' THEN o.createdAt END ASC, " +
            "CASE WHEN :sort = 'desc' THEN o.createdAt END DESC")
    Page<Order> findOrders(
            @Param("userId") Long userId,
            @Param("status") OrderStatus status,
            Pageable pageable,
            @Param("sort") String sort
    );


    @Query("""
    SELECT o FROM Order o
    WHERE o.isDelete <> true
    AND (:orderStatus IS NULL OR o.status = :orderStatus)
    AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)
    AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod)
    AND (:startDate IS NULL OR o.createdAt >= :startDate)
    AND (:endDate IS NULL OR o.createdAt <= :endDate)
""")
    Page<Order> getAllOrders(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            Pageable pageable
    );


    @Query("SELECT new org.example.laptopstore.dto.response.order.RevenueYear(" +
            "YEAR(oi.order.createdAt), " +
            "SUM(oi.priceAtOrderTime * oi.quantity - oi.order.discount)) " +
            "FROM OrderItem oi " +
            "WHERE oi.order.paymentStatus = 'PAID' AND oi.isDelete <> true " +
            "GROUP BY YEAR(oi.order.createdAt) " +
            "ORDER BY YEAR(oi.order.createdAt) ASC")
    List<RevenueYear> getRevenueByYear();

    @Query("SELECT new org.example.laptopstore.dto.response.order.RevenueMonth(" +
            "MONTH(oi.order.createdAt), " +
            "SUM(oi.priceAtOrderTime * oi.quantity), " +
            "COUNT(oi)) " +
            "FROM OrderItem oi " +
            "WHERE oi.order.paymentStatus = 'PAID' " +
            "AND oi.order.isDelete <> true " +
            "AND YEAR(oi.order.createdAt) = :year " +
            "GROUP BY MONTH(oi.order.createdAt) " +
            "ORDER BY MONTH(oi.order.createdAt)")
    List<RevenueMonth> getRevenueByMonth(@Param("year") Integer year);



}
