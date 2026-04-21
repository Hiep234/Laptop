package org.example.laptopstore.repository;

import org.example.laptopstore.dto.MessagesDTO;
import org.example.laptopstore.dto.response.message.UserMessage;
import org.example.laptopstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    @Query("SELECT u FROM User u WHERE " +
            "u.isDelete = false AND " +
            "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "AND u.role.name <> 'ADMIN'"
    )
    Page<User> findAllByKeyword(String keyword, Pageable pageable);

    @Query("Select u.balance from User u where u.id = :userId ")
    BigDecimal findBalanceByUserId(@Param("userId") Long userId);


    @Query("""
    SELECT new org.example.laptopstore.dto.response.message.UserMessage(
        u.id,
        u.fullName
    )
    FROM Message m
    JOIN m.sender u
    WHERE u.role.name != 'ADMIN'
    GROUP BY u.id, u.fullName
    ORDER BY MAX(m.createdAt) DESC
""")
    Page<UserMessage> getAllUser(Pageable pageable);


    @Query("""
    SELECT COUNT(u) 
    FROM User u 
    WHERE YEAR(u.createdAt) = :year 
    AND MONTH(u.createdAt) = :month
""")
    Integer getTotalUserByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

}
