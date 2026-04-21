package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.entity.District;
import org.example.laptopstore.service.DistrictService;
import org.example.laptopstore.util.Constant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/districts")
public class DistrictController {

    private final DistrictService districtService;

    @GetMapping("/{provinceId}")
    public ApiResponse<Object> getDistrictsByProvince(@PathVariable Integer provinceId) {
        List<District> districts = districtService.getDistrictsByProvinceId(provinceId);
        return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(districts).build();
    }
}
