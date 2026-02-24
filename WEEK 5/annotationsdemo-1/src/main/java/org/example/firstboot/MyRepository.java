package org.example.firstboot;

import org.springframework.stereotype.Repository;

@Repository
public class MyRepository {

    public String getMessage() {
        return "Spring Boot Annotations Project Running Successfully!";
    }
}