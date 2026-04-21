package org.example.laptopstore.repository;

import org.example.laptopstore.entity.ImageThumbnail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageThumbnailRepository extends JpaRepository<ImageThumbnail, Long> {
}
