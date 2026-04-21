package org.example.laptopstore.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;

import org.example.laptopstore.exception.BadRequestException;
import org.example.laptopstore.service.ImageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {
    private final Cloudinary cloudinary;
    @Override
    public String uploadImage(MultipartFile file) {
        try {
            //up image lên folders uploads
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "uploads"));
            return uploadResult.get("url").toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload image");
        }
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        if (imageUrl.startsWith("http://res.cloudinary.com/")) {
            try {

                // Tách lấy publicId từ imageUrl
                String publicId = imageUrl.substring(imageUrl.lastIndexOf("uploads/"), imageUrl.lastIndexOf("."));

                // Gọi Cloudinary API để xóa ảnh
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

                // Kiểm tra kết quả trả về
                String status = (String) result.get("result");
                return status.equals("ok");
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete image", e);
            }
        }
        return true;
    }
}
