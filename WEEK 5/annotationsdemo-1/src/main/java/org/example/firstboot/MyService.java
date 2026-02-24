package org.example.firstboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MyService {

    @Autowired
    private MyRepository repo;

    public String getGreeting() {
        return repo.getMessage();
    }
}