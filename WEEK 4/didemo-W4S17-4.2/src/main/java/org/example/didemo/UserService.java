package org.example.didemo;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public String getMessage() {
        return "Service class method called successfully!";
    }
}