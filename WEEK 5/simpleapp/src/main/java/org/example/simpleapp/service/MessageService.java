package org.example.simpleapp.service;

import org.springframework.stereotype.Service;
import org.example.simpleapp.repository.MessageRepository;

@Service
public class MessageService {

    private final MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
    }

    public String fetchMessage() {
        return repository.getMessage();
    }
}
