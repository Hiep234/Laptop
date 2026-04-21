package org.example.laptopstore.dto.response;

import lombok.Data;

import java.util.List;
@Data
public class RecommendationResponse {
    private int count;
    private List<Long> recommended_product_option_ids;
    private Long user_id;
}
