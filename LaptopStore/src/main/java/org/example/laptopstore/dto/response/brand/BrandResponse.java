package org.example.laptopstore.dto.response.brand;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String countryName;
    private Integer count;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
