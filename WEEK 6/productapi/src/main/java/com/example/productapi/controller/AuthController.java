package com.example.productapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.productapi.model.User;

import jakarta.validation.Valid;

@RestController
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody User user) {
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password) {

        if(username.equals("admin") && password.equals("123")) {
            return "JWT_TOKEN_GENERATED";
        }

        return "Invalid credentials";
    }
}