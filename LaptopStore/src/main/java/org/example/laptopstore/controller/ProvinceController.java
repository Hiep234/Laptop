package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.service.ProvinceService;
import org.example.laptopstore.util.Constant;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/provinces")
public class ProvinceController {

    private final ProvinceService provinceService;

    @GetMapping
    public ApiResponse<Object> getAllProvinces() {
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message(Constant.SUCCESS_MESSAGE)
                .data(provinceService.getAllProvinces())
                .build();
    }
}
