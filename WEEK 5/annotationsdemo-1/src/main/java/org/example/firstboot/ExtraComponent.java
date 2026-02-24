package org.example.firstboot;

import org.springframework.stereotype.Component;

@Component
public class ExtraComponent {

    public String info() {
        return "This is an extra component bean.";
    }
}