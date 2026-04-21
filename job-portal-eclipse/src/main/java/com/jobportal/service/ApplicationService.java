package com.jobportal.service;

import com.jobportal.model.*;
import com.jobportal.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public Application applyForJob(Job job, User student, String coverLetter) {
        if (applicationRepository.existsByJobAndStudent(job, student)) {
            throw new IllegalArgumentException("You have already applied for this job.");
        }
        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new IllegalArgumentException("This job is no longer accepting applications.");
        }
        Application application = new Application();
        application.setJob(job);
        application.setStudent(student);
        application.setCoverLetter(coverLetter);
        application.setStatus(ApplicationStatus.PENDING);
        return applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByStudent(User student) {
        return applicationRepository.findByStudent(student);
    }

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByJob(Job job) {
        return applicationRepository.findByJob(job);
    }

    @Transactional(readOnly = true)
    public List<Application> getApplicationsForEmployerJobs(List<Job> jobs) {
        return applicationRepository.findByJobIn(jobs);
    }

    @Transactional(readOnly = true)
    public Application findById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));
    }

    @Transactional(readOnly = true)
    public boolean hasApplied(Job job, User student) {
        return applicationRepository.existsByJobAndStudent(job, student);
    }

    public Application updateStatus(Long applicationId, ApplicationStatus status, User employer) {
        Application application = findById(applicationId);
        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this application.");
        }
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public long countByStudent(User student) {
        return applicationRepository.countByStudent(student);
    }

    @Transactional(readOnly = true)
    public long countAllApplications() {
        return applicationRepository.count();
    }

    @Transactional(readOnly = true)
    public long countByJobsAndStatus(List<Job> jobs, ApplicationStatus status) {
        if (jobs.isEmpty()) return 0;
        return applicationRepository.countByJobInAndStatus(jobs, status);
    }
}
