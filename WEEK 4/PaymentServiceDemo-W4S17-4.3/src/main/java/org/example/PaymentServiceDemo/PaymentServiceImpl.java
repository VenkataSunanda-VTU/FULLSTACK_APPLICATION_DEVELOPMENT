package org.example.PaymentServiceDemo;

import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Override
    public String processPayment() {
        return "Payment processed successfully!";
    }
}
