package org.example.simpleapp.repository;

import org.springframework.stereotype.Repository;

@Repository
public class MessageRepository {

    public String getMessage() {
        return "Hello from Repository!";
    }
}
