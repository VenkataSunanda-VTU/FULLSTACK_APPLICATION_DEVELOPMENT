package org.example.NotificationServiceDemo;

import org.springframework.stereotype.Service;

@Service("smsService")
public class SMSNotificationService implements NotificationService {

    @Override
    public String sendNotification() {
        return "SMS notification sent!";
    }
}