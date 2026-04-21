package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.service.OrderSerivce;
import org.example.laptopstore.util.Constant;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/revenue")
public class RevenueController {
    private final OrderSerivce orderSerivce;

    @GetMapping("/year")
    public ApiResponse<Object> getRevenueByYear(){
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(orderSerivce.revenueInYear()).build();
    }
    @GetMapping("/month/{year}")
    public ApiResponse<Object> getRevenueByMonth(@PathVariable int year){
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(orderSerivce.revenueMonth(year)).build();
    }

}
