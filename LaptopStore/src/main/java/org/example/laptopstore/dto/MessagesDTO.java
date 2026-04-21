package org.example.laptopstore.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class MessagesDTO {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime createdAt;

    // Constructor mới, chỉ đúng số trường @Query đang gọi
    public MessagesDTO(Long id, String content, LocalDateTime createdAt, Long senderId, Long receiverId) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
}




