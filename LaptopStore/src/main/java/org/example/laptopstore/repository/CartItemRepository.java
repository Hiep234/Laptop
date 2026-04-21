package org.example.laptopstore.repository;

import org.example.laptopstore.dto.response.cartitem.CartItemResponse;
import org.example.laptopstore.entity.CartItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("""
    SELECT NEW org.example.laptopstore.dto.response.cartitem.CartItemResponse(
        c.id,
        c.productVariant.id,
        c.productVariant.option.product.name,
        c.productVariant.option.code,
        c.productVariant.option.cpu,
        c.productVariant.option.ram,
        c.productVariant.option.storage,
        c.productVariant.option.gpu,
        concat('Màu ', c.productVariant.color),
        c.productVariant.option.price,
        c.productVariant.priceDiff,
        c.productVariant.imageUrl,
        c.quantity
    )
    FROM CartItem c
    WHERE c.user.id = :id
    ORDER BY c.createdAt DESC
""")
    Page<CartItemResponse> getCartItems(Pageable pageable, @Param("id") Long id);

    @Query("Select c from CartItem c where c.productVariant.id = :idProductVariant and c.user.id = :idUser")
    CartItem getCartItemExists(@Param("idProductVariant") Long idProductVariant,@Param("idUser") Long idUser);


    @Query("Select count(*) from CartItem c where c.user.id = :id")
    Integer getCartItemsCount(@Param("id") Long id);
    
}
