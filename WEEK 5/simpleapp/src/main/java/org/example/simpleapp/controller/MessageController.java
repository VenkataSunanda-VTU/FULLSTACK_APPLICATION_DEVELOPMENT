package org.example.simpleapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.stereotype.Component;
import org.example.simpleapp.service.MessageService;

@RestController
@Component
public class MessageController {

    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @GetMapping("/")
    public String showMessage() {
        return service.fetchMessage();
    }
}
