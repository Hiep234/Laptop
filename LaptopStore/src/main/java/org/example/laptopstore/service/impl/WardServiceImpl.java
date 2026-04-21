package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.entity.Ward;
import org.example.laptopstore.repository.WardRepository;
import org.example.laptopstore.service.WardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WardServiceImpl implements WardService {

    private final WardRepository wardRepository;

    @Override
    public List<Ward> getWardsByDistrictId(Integer districtId) {
        return wardRepository.findByDistrictId(districtId);
    }

    @Override
    public Ward getWardById(Integer wardId) {
        return wardRepository.findById(wardId).orElse(null);
    }
}
