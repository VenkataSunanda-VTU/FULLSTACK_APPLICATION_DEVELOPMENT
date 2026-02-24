package org.example.OptionalDependencyDemo;

import org.springframework.stereotype.Component;

@Component
public class GreetingService {

    public String greet() {
        return "Greeting Service is available!";
    }
}