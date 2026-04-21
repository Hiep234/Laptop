package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.discount.DiscountRequest;
import org.example.laptopstore.dto.response.discount.DiscountResponse;
import org.example.laptopstore.entity.Discount;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DiscountMapper {

    private final ModelMapper modelMapper;

    public Discount mapRequestToEntity(DiscountRequest discountRequest) {
        if (discountRequest == null) {
            return null;
        }
        return modelMapper.map(discountRequest, Discount.class);
    }

    public void updateRequestToEntity(Discount discount, DiscountRequest discountRequest) {
        if (discount == null || discountRequest == null) {
            return;
        }
        modelMapper.map(discountRequest, discount);
    }

    public DiscountResponse toDiscountResponse(Discount discount) {
        if (discount == null) {
            return null;
        }
        return modelMapper.map(discount, DiscountResponse.class);
    }
}
