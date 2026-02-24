package org.example.firstboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @Autowired
    private MyService service;

    // Simple method using service
    @GetMapping("/hi")
    public String sayHello() {
        return service.getGreeting();   // "Spring Boot Annotations Project Running Successfully!"
    }

    // Using @PathVariable
    @GetMapping("/hello/{name}")
    public String helloName(@PathVariable String name) {
        return "Hello, " + name;       // Now it uses the value from the URL
    }

    // Using @RequestParam
    @GetMapping("/greet")
    public String greetParam(@RequestParam(defaultValue="Guest") String name) {
        return "Greetings " + name;    // Now it uses the query parameter
    }
}
