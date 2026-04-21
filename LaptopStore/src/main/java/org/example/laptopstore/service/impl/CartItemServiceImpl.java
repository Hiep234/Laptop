package org.example.laptopstore.service.impl;

import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.cart.CartItemRequest;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.cartitem.CartItemResponse;
import org.example.laptopstore.dto.response.cartitem.QuantityChange;
import org.example.laptopstore.entity.CartItem;
import org.example.laptopstore.exception.AppException;
import org.example.laptopstore.exception.ErrorCode;
import org.example.laptopstore.repository.CartItemRepository;
import org.example.laptopstore.service.CartItemService;
import org.example.laptopstore.service.ProductVariantSerivce;
import org.example.laptopstore.service.UserAccountService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Data
@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService {
    private final CartItemRepository cartItemRepository;
    private final UserAccountService userAccountService;
    private final ProductVariantSerivce productVariantSerivce;
    private final ModelMapper modelMapper;
    @Override
    public PageResponse<CartItemResponse> getCartByIdUser(int page, int size, Long idUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CartItemResponse> cartItems = cartItemRepository.getCartItems(pageable, idUser);

        return new PageResponse<>(cartItems);
    }


    @Override
    @Transactional
    public QuantityChange setChangeQuantity(Long cartId,Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartId)
                .orElseThrow(() -> new AppException(ErrorCode.ERROR_CODE_NOT_FOUND));
        if(quantity > cartItem.getProductVariant().getStock()){
            throw new AppException(ErrorCode.NOT_ENOUGH_QUANTITY);
        }
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        QuantityChange quantityChange = new QuantityChange();
        quantityChange.setIdCartItem(cartItem.getId());
        quantityChange.setResult("Quantity changed to " + cartItem.getQuantity());
        quantityChange.setQuantity(cartItem.getQuantity());
        return quantityChange;
    }

    @Override
    @Transactional
    public void removeListCartItem(List<Long> listIdCart) {
        List<CartItem> cartItems = cartItemRepository.findAllById(listIdCart);
        cartItemRepository.deleteAll(cartItems);
    }

    @Override
    public void removeCartItem(Long idCartItem) {
        cartItemRepository.delete(cartItemRepository.findById(idCartItem).orElseThrow());
    }

    @Override
    public CartItemResponse insertCartItem(CartItemRequest cartItem) {
        CartItem cartItemEntity = new CartItem();
        if(cartItemRepository.getCartItemExists(cartItem.getProductVariantId(),cartItem.getUserId()) != null){
            CartItem oldCartItem = cartItemRepository.getCartItemExists(cartItem.getProductVariantId(),cartItem.getUserId());
            if(Objects.equals(oldCartItem.getProductVariant().getId(), cartItem.getProductVariantId())) {
                oldCartItem.setQuantity(oldCartItem.getQuantity() + 1);
                return modelMapper.map(cartItemRepository.save(oldCartItem), CartItemResponse.class);
            }
        }
        cartItemEntity.setQuantity(cartItem.getQuantity());
        cartItemEntity.setUser(userAccountService.getUserById(cartItem.getUserId()));
        cartItemEntity.setProductVariant(productVariantSerivce.getProductVariant(cartItem.getProductVariantId()));
        cartItemRepository.save(cartItemEntity);
        return modelMapper.map(cartItemEntity, CartItemResponse.class);
    }

    @Override
    public Integer getTotalQuantity(Long userId) {
        return cartItemRepository.getCartItemsCount(userId);
    }
}
