package org.example.laptopstore.dto.response.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private Integer count;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
