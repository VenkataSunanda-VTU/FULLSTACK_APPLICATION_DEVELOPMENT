package org.example.firstboot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${app.name}")
    private String appName;

    @Bean
    public String applicationName() {
        return "App Name: " + appName;
    }
}
