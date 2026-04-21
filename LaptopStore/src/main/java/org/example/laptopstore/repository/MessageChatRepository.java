package org.example.laptopstore.repository;

import org.example.laptopstore.dto.MessagesDTO;
import org.example.laptopstore.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface MessageChatRepository extends JpaRepository<Message, Long> {
    @Query("""
    SELECT new org.example.laptopstore.dto.MessagesDTO(
        m.id,
        m.content,
        m.createdAt,
        m.sender.id,
        m.receiver.id
    )
    FROM Message m
    WHERE (m.sender.id = :senderId AND m.receiver.id = :receiverId) 
       OR (m.sender.id = :receiverId AND m.receiver.id = :senderId)
    ORDER BY m.createdAt DESC
""")
    Page<MessagesDTO> getMessagesById(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId, Pageable pageable);


}
