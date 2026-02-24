package org.example.OptionalDependencyDemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OptionalController {

    @Autowired(required = false)
    private GreetingService greetingService;

    @GetMapping("/check")
    public String checkService() {

        if (greetingService != null) {
            return greetingService.greet();
        } else {
            return "Greeting Service is NOT available!";
        }
    }
}