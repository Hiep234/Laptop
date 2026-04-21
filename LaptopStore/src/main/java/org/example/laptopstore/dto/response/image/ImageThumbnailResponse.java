package org.example.laptopstore.dto.response.image;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageThumbnailResponse {

    private Long id;

    private String url;
}
