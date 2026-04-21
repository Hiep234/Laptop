package org.example.laptopstore.mapper;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.request.withdrawal.WithdrawalRequest;
import org.example.laptopstore.dto.response.user.UserResponse;
import org.example.laptopstore.dto.response.withdrawal.WithdrawalResponse;
import org.example.laptopstore.entity.Withdrawal;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WithdrawalMapper {

    private final ModelMapper modelMapper;

    public Withdrawal mapToEntity(WithdrawalRequest withdrawalRequest) {
        return modelMapper.map(withdrawalRequest, Withdrawal.class);
    }

    public WithdrawalResponse mapToResponse(Withdrawal withdrawal) {
        WithdrawalResponse response = modelMapper.map(withdrawal, WithdrawalResponse.class);
        response.setUser(modelMapper.map(withdrawal.getUser(), UserResponse.class));
        return response;
    }
}
