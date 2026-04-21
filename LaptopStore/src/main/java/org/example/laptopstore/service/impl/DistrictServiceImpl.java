package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.entity.District;
import org.example.laptopstore.repository.DistrictRepository;
import org.example.laptopstore.service.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DistrictServiceImpl implements DistrictService {

    private final DistrictRepository districtRepository;

    @Override
    public List<District> getDistrictsByProvinceId(Integer provinceId) {
        return districtRepository.findByProvinceId(provinceId);
    }
}
