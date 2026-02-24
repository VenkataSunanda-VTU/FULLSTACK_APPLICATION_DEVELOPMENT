package org.example.firstboot;

import org.springframework.stereotype.Repository;

@Repository
public class MyRepository {

    public String fetchData() {
        return "Spring Boot annotations executed successfully!";
    }
}
