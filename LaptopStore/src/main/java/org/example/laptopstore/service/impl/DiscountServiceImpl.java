package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.discount.DiscountRequest;
import org.example.laptopstore.dto.response.discount.DiscountResponse;
import org.example.laptopstore.entity.Discount;
import org.example.laptopstore.entity.Product;
import org.example.laptopstore.exception.AppException;
import org.example.laptopstore.exception.ConflictException;
import org.example.laptopstore.exception.ErrorCode;
import org.example.laptopstore.exception.NotFoundException;
import org.example.laptopstore.mapper.DiscountMapper;
import org.example.laptopstore.repository.DiscountRepository;
import org.example.laptopstore.repository.ProductRepository;
import org.example.laptopstore.service.DiscountService;
import org.example.laptopstore.util.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;
    private final DiscountMapper discountMapper;

    @Override
    public DiscountResponse getDiscountById(Long id) {
        Discount discount = discountRepository.findByIdAndIsDeleteFalse(id).orElseThrow(() -> new NotFoundException("Discount not found"));
        return discountMapper.toDiscountResponse(discount);
    }

    @Override
    public Page<DiscountResponse> getAllDiscountsPagination(String keyword, DiscountType discountType, Boolean isActive, LocalDate startDate, LocalDate endDate, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        return discountRepository.getAllDiscountPagination(keyword, discountType, isActive, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.atTime(LocalTime.MAX) : null, pageable)
                .map(discountMapper::toDiscountResponse);
    }

    @Override
    @Transactional
    public DiscountResponse createDiscount(DiscountRequest discountRequest) {
        if(discountRepository.existsByCodeAndIsDeleteFalse(discountRequest.getCode())) {
            throw new ConflictException("Discount code already exists");
        }
        Discount discount = discountMapper.mapRequestToEntity(discountRequest);
        return discountMapper.toDiscountResponse(discountRepository.save(discount));
    }

    @Override
    @Transactional
    public DiscountResponse updateDiscount(Long id, DiscountRequest discountRequest) {
        if(discountRepository.existsByCodeAndIsDeleteFalseAndIdNot(discountRequest.getCode(), id)) {
            throw new ConflictException("Discount code already exists");
        }
        Discount discount = discountRepository.findByIdAndIsDeleteFalse(id).orElseThrow(() -> new NotFoundException("Discount not found"));
        discountMapper.updateRequestToEntity(discount, discountRequest);
        return discountMapper.toDiscountResponse(discountRepository.save(discount));
    }

    @Override
    @Transactional
    public void deleteDiscount(Long id) {
        Discount discount = discountRepository.findByIdAndIsDeleteFalse(id).orElseThrow(() -> new NotFoundException("Discount not found"));
        discount.setIsDelete(true);
        discountRepository.save(discount);
    }

    @Override
    public void miniusDiscount(Long id) {
        Discount discount = discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ERROR_CODE_NOT_FOUND));
        discount.setQuantity(discount.getQuantity() - 1);
        discountRepository.save(discount);
    }


}
