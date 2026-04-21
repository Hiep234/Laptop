package org.example.laptopstore.repository;

import org.example.laptopstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT SUM((oi.priceAtOrderTime * oi.quantity) - oi.quantity) FROM OrderItem oi WHERE oi.order.id = :orderId")
    BigDecimal countTotal(@Param("orderId") Long orderId);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0)  FROM OrderItem oi WHERE oi.productVariant.option.id = :productOptionId")
    long countProductOptionSold(Long productOptionId);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0)  FROM OrderItem oi WHERE oi.productVariant.option.product.id = :productId")
    long countProductSold(Long productId);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.productVariant.id = :productVariantId")
    long countProductVariantSold(Long productVariantId);

    @Query("SELECT  oi from OrderItem oi where oi.order.id = :orderId ")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);



}
