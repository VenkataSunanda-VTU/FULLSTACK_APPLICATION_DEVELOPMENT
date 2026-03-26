package com.example.springmvc_jpa_customquery.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.springmvc_jpa_customquery.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    @Query("SELECT s FROM Student s WHERE s.course = ?1")
    List<Student> findStudentsByCourse(String course);

}