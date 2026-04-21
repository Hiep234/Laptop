package org.example.laptopstore.service;


import org.example.laptopstore.dto.request.cart.CartItemRequest;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.cartitem.CartItemResponse;
import org.example.laptopstore.dto.response.cartitem.QuantityChange;


import java.util.List;


public interface CartItemService {
     PageResponse<CartItemResponse> getCartByIdUser(int page,int size,Long idUser);
     QuantityChange setChangeQuantity(Long cartId,Integer quantity);
     void removeListCartItem(List<Long> idCartItem);
     void removeCartItem(Long idCartItem);
     CartItemResponse insertCartItem(CartItemRequest cartItem);
     Integer getTotalQuantity(Long userId);
}
