package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.cart.CartItemRequest;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.service.CartItemService;
import org.example.laptopstore.util.Constant;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart")
public class CartItemController {
    private final CartItemService cartItemService;
    @GetMapping("/{idUser}")
    public ApiResponse<Object> getCartItemById(@RequestParam(defaultValue = "0")int page,@RequestParam(defaultValue = "5")int size, @PathVariable("idUser") Long idUser) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(cartItemService.getCartByIdUser(page,size,idUser)).build();
    }
    @PostMapping("/update")
    public ApiResponse<Object> updateCartItem(@RequestParam Long id , @RequestParam Integer quantity) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(cartItemService.setChangeQuantity(id,quantity)).build();
    }
    @DeleteMapping
    public ApiResponse<Object> deleteListCartItem(@RequestParam List<Long> listId) {
        cartItemService.removeListCartItem(listId);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).build();
    }
    @DeleteMapping("/only")
    public ApiResponse<Object> deleteCartItem(@RequestParam Long id) {
        cartItemService.removeCartItem(id);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).build();
    }

    @PostMapping("/insert")
    public ApiResponse<Object> insertCartItem(@RequestBody CartItemRequest cartItemRequest) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(cartItemService.insertCartItem(cartItemRequest)).build();
    }
    @GetMapping("total/{idUser}")
    public ApiResponse<Object> getCartItemById(@PathVariable("idUser") Long idUser) {
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(cartItemService.getTotalQuantity(idUser)).build();
    }
}
