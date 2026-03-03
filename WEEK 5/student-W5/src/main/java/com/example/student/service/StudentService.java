package com.example.student.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.example.student.entity.Student;
import com.example.student.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    public Student save(Student s) {
        return repo.save(s);
    }

    public List<Student> getAll() {
        return repo.findAll();
    }

    public Student getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Student update(Long id, Student s) {
        Student existing = repo.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(s.getName());        // ✅ now works
            existing.setAge(s.getAge());          // ✅ now works
            existing.setDepartment(s.getDepartment()); // ✅ now works
            return repo.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Student> getByDepartment(String dept) {
        return repo.findByDepartment(dept);
    }

    public List<Student> getByAgeGreaterThan(int age) {
        return repo.findByAgeGreaterThan(age);
    }

    public List<Student> getSorted(String field) {
        return repo.findAll(Sort.by(Sort.Direction.ASC, field));
    }

    public Page<Student> getPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findAll(pageable);
    }
}