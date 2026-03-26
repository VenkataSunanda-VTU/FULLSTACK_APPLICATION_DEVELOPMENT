package com.example.springmvc_jpa_customquery.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.springmvc_jpa_customquery.entity.Student;
import com.example.springmvc_jpa_customquery.service.StudentService;

@RestController
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/add")
    public Student addStudent(@RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    @GetMapping("/all")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/course/{course}")
    public List<Student> getStudentsByCourse(@PathVariable String course) {
        return studentService.getStudentsByCourse(course);
    }

    @PutMapping("/update")
    public Student updateStudent(@RequestBody Student student) {
        return studentService.updateStudent(student);
    }
    @DeleteMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Integer id) {
        studentService.deleteStudent(id);
        return "Student with ID " + id + " deleted successfully!";
    }
}