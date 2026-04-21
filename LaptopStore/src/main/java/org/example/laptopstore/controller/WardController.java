package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.entity.Ward;
import org.example.laptopstore.service.WardService;
import org.example.laptopstore.util.Constant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @GetMapping("/{districtId}")
    public ApiResponse<Object> getWardsByDistrict(@PathVariable Integer districtId) {
        List<Ward> wards = wardService.getWardsByDistrictId(districtId);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(wards).build();
    }
}
