package com.example.springmvc_jpa_customquery.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springmvc_jpa_customquery.entity.Student;
import com.example.springmvc_jpa_customquery.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsByCourse(String course) {
        return studentRepository.findStudentsByCourse(course);
    }

    public Student updateStudent(Student student) {
        return studentRepository.save(student);
    }
    public void deleteStudent(Integer id) {
        studentRepository.deleteById(id);
    }
}