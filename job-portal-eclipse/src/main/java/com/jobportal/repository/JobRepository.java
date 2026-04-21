package com.jobportal.repository;

import com.jobportal.model.Job;
import com.jobportal.model.JobStatus;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.status = :status")
    List<Job> findByStatus(@Param("status") JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.employer = :employer")
    List<Job> findByEmployer(@Param("employer") User employer);

    @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.employer = :employer AND j.status = :status")
    List<Job> findByEmployerAndStatus(@Param("employer") User employer, @Param("status") JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.status = com.jobportal.model.JobStatus.ACTIVE AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Job> searchJobs(@Param("keyword") String keyword);

    @Query("SELECT j FROM Job j JOIN FETCH j.employer")
    List<Job> findAllWithEmployer();

    long countByStatus(JobStatus status);
    long countByEmployer(User employer);
}