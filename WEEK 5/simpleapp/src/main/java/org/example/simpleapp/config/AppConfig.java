package org.example.simpleapp.config;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan("org.example.simpleapp")
@Configuration
public class AppConfig {

    @Bean
    public String appName() {
        return "Simple Message Application";
    }
}
