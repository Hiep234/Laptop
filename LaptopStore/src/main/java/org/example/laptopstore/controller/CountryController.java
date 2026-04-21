package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.response.ApiResponse;
import org.example.laptopstore.entity.Country;
import org.example.laptopstore.service.CountryService;
import org.example.laptopstore.util.Constant;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/countries")
public class CountryController {
    private final CountryService countryService;

    @GetMapping
    public ApiResponse<Object> getAllCountries() {
        List<Country> countryList = countryService.getAllCountries();
         return ApiResponse.builder().code(HttpStatus.OK.value()).message(Constant.SUCCESS_MESSAGE).data(countryList).build();
    }
}
