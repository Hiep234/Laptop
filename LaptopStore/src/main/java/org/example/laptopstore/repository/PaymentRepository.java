package org.example.laptopstore.repository;

import org.example.laptopstore.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);

    @Query(value = "WITH months AS ( " +
            "    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL n MONTH), '%Y-%m') AS month " +
            "    FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 " +
            "          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 " +
            "          UNION ALL SELECT 10 UNION ALL SELECT 11) AS numbers " +
            ") " +
            "SELECT m.month, COALESCE(SUM(p.amount), 0) AS total_revenue " +
            "FROM months m " +
            "LEFT JOIN payment p ON DATE_FORMAT(p.payment_date, '%Y-%m') = m.month AND p.status_payment = 0 " +
            "GROUP BY m.month " +
            "ORDER BY m.month ASC",
            nativeQuery = true)
    List<Object[]> statisticsRevenue();

}