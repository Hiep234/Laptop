package org.example.laptopstore.service;

import org.example.laptopstore.entity.Ward;
import java.util.List;

public interface WardService {
    List<Ward> getWardsByDistrictId(Integer districtId);
    Ward getWardById(Integer wardId);
}
