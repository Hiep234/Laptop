package org.example.laptopstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.MessagesDTO;
import org.example.laptopstore.service.impl.MessageChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;


@RestController
@RequiredArgsConstructor
public  class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageChatService messageChatService;
    // Gửi tin nhắn từ client
    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload MessagesDTO message) throws ParseException {
        messagingTemplate.convertAndSendToUser(message.getReceiverId() + "", "/queue/messages", message);
        messageChatService.saveMessage(message);
    }

}
