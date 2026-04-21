package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Job;
import com.jobportal.model.JobStatus;
import com.jobportal.model.User;
import com.jobportal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;

    @Autowired
    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job postJob(JobDto dto, User employer) {
        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setSalary(dto.getSalary());
        job.setJobType(dto.getJobType());
        job.setCategory(dto.getCategory());
        job.setStatus(JobStatus.ACTIVE);
        job.setEmployer(employer);
        return jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByStatus(JobStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Job> getAllJobs() {
        return jobRepository.findAllWithEmployer();
    }

    @Transactional(readOnly = true)
    public Job findById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Job> getJobsByEmployer(User employer) {
        return jobRepository.findByEmployer(employer);
    }

    @Transactional(readOnly = true)
    public List<Job> searchJobs(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllActiveJobs();
        return jobRepository.searchJobs(keyword.trim());
    }

    public Job toggleJobStatus(Long id, User employer) {
        Job job = findById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("Unauthorized to modify this job.");
        }
        job.setStatus(job.getStatus() == JobStatus.ACTIVE ? JobStatus.CLOSED : JobStatus.ACTIVE);
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public Job saveJob(Job job) {
        return jobRepository.save(job);
    }

    public Job updateJob(Long id, JobDto dto, User employer) {
        Job job = findById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("Unauthorized to modify this job.");
        }
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setSalary(dto.getSalary());
        job.setJobType(dto.getJobType());
        job.setCategory(dto.getCategory());
        return jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public long countActiveJobs() {
        return jobRepository.countByStatus(JobStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public long countByEmployer(User employer) {
        return jobRepository.countByEmployer(employer);
    }
}