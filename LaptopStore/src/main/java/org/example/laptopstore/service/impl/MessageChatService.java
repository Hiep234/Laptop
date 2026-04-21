package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.dto.MessagesDTO;
import org.example.laptopstore.dto.response.PageResponse;
import org.example.laptopstore.dto.response.message.UserMessage;
import org.example.laptopstore.entity.Message;
import org.example.laptopstore.repository.MessageChatRepository;
import org.example.laptopstore.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Service
@RequiredArgsConstructor
public class MessageChatService {

    private final MessageChatRepository messageChatRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public void saveMessage(MessagesDTO message) {
        Message savedMessage = modelMapper.map(message, Message.class);
        savedMessage.setReceiver(userRepository.getById(message.getReceiverId()));
        savedMessage.setSender(userRepository.getById(message.getSenderId()));
        messageChatRepository.save(savedMessage);
    }

    public PageResponse<UserMessage> getAllUser(int page,int size){
        Pageable pageable = PageRequest.of(page, size);
        Page<UserMessage> messages = userRepository.getAllUser(pageable);
        return new PageResponse<>(messages);
    }
    public PageResponse<MessagesDTO> getMessageUser(int page, int size, Long receiverId,Long senderId) {
        Pageable pageable = PageRequest.of(page , size);
        Page<MessagesDTO> userMessages = messageChatRepository.getMessagesById(senderId,receiverId,pageable);
        List<MessagesDTO> modifiableMessages = new ArrayList<>(userMessages.getContent());
        Collections.reverse(modifiableMessages);
        Page<MessagesDTO> reversedPage = new PageImpl<>(modifiableMessages, pageable, userMessages.getTotalElements());
        return new PageResponse<>(reversedPage);
    }
}
