package org.example.laptopstore.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
    String uploadImage(MultipartFile file);
    boolean deleteImage(String imageUrl);
}
