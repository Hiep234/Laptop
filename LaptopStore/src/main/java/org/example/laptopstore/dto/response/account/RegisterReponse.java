package org.example.laptopstore.dto.response.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterReponse {
    @NotBlank
    private String username;

    @Email
    @NotBlank
    private String email;


}
