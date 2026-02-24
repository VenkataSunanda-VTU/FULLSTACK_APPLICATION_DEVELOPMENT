package org.example.studentportal.controller;

import org.example.studentportal.entity.Student;
import org.example.studentportal.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/students")
public class StudentController {

    private final StudentRepository repo;

    public StudentController(StudentRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return repo.save(student);
    }
}
