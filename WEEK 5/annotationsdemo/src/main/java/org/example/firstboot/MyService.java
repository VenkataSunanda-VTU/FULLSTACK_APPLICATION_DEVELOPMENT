package org.example.firstboot;

import org.springframework.stereotype.Service;

@Service
public class MyService {

    private final MyRepository myRepository;

    public MyService(MyRepository myRepository) {
        this.myRepository = myRepository;
    }

    public String getMessage() {
        return myRepository.fetchData();
    }
}
