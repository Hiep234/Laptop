package org.example.laptopstore.service;

import org.example.laptopstore.entity.District;
import java.util.List;

public interface DistrictService {
    List<District> getDistrictsByProvinceId(Integer provinceId);
}
