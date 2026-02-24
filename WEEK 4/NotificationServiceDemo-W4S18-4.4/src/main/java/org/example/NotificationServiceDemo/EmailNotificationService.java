package org.example.NotificationServiceDemo;

import org.springframework.stereotype.Service;

@Service("emailService")
public class EmailNotificationService implements NotificationService {

    @Override
    public String sendNotification() {
        return "Email notification sent!";
    }
}