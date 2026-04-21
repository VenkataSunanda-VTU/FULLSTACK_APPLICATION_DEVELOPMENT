package com.jobportal.repository;

import com.jobportal.model.Application;
import com.jobportal.model.ApplicationStatus;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.employer JOIN FETCH a.student WHERE a.student = :student")
    List<Application> findByStudent(@Param("student") User student);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.employer JOIN FETCH a.student WHERE a.job = :job")
    List<Application> findByJob(@Param("job") Job job);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.employer JOIN FETCH a.student WHERE a.job IN :jobs")
    List<Application> findByJobIn(@Param("jobs") List<Job> jobs);

    Optional<Application> findByJobAndStudent(Job job, User student);
    boolean existsByJobAndStudent(Job job, User student);
    long countByStudent(User student);
    long countByJobIn(List<Job> jobs);
    long countByJobInAndStatus(List<Job> jobs, ApplicationStatus status);
}