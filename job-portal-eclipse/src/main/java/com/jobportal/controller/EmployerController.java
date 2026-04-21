package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.model.*;
import com.jobportal.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/employer")
public class EmployerController {

    private final UserService userService;
    private final JobService jobService;
    private final ApplicationService applicationService;

    @Autowired
    public EmployerController(UserService userService, JobService jobService, ApplicationService applicationService) {
        this.userService = userService;
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername());
    }

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User employer = getCurrentUser(userDetails);
        List<Job> myJobs = jobService.getJobsByEmployer(employer);
        List<Application> allApps = applicationService.getApplicationsForEmployerJobs(myJobs);
        long activeJobs = myJobs.stream().filter(j -> j.getStatus() == JobStatus.ACTIVE).count();
        long shortlisted = allApps.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
        long pending = allApps.stream().filter(a -> a.getStatus() == ApplicationStatus.PENDING).count();
        model.addAttribute("employer", employer);
        model.addAttribute("totalJobs", myJobs.size());
        model.addAttribute("activeJobs", activeJobs);
        model.addAttribute("totalApps", allApps.size());
        model.addAttribute("shortlisted", shortlisted);
        model.addAttribute("pending", pending);
        model.addAttribute("recentJobs", myJobs.stream().limit(5).toList());
        return "employer/dashboard";
    }

    @GetMapping("/jobs")
    public String myJobs(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        model.addAttribute("jobs", jobService.getJobsByEmployer(getCurrentUser(userDetails)));
        return "employer/jobs";
    }

    @GetMapping("/jobs/new")
    public String newJobForm(Model model) {
        model.addAttribute("jobDto", new JobDto());
        return "employer/job-form";
    }

    @PostMapping("/jobs/new")
    public String postJob(@Valid @ModelAttribute("jobDto") JobDto jobDto, BindingResult result,
                          @AuthenticationPrincipal UserDetails userDetails,
                          RedirectAttributes redirectAttributes, Model model) {
        if (result.hasErrors()) return "employer/job-form";
        try {
            jobService.postJob(jobDto, getCurrentUser(userDetails));
            redirectAttributes.addFlashAttribute("successMessage", "Job posted successfully!");
            return "redirect:/employer/jobs";
        } catch (Exception e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "employer/job-form";
        }
    }

    @GetMapping("/jobs/{id}/edit")
    public String editJobForm(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, Model model) {
        User employer = getCurrentUser(userDetails);
        Job job = jobService.findById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) return "redirect:/employer/jobs";
        model.addAttribute("jobDto", new JobDto(job.getTitle(), job.getDescription(), job.getCompany(),
                job.getLocation(), job.getSalary(), job.getJobType(), job.getCategory()));
        model.addAttribute("jobId", id);
        return "employer/job-form";
    }

    @PostMapping("/jobs/{id}/edit")
    public String updateJob(@PathVariable Long id,
                            @Valid @ModelAttribute("jobDto") JobDto jobDto, BindingResult result,
                            @AuthenticationPrincipal UserDetails userDetails,
                            RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) return "employer/job-form";
        jobService.updateJob(id, jobDto, getCurrentUser(userDetails));
        redirectAttributes.addFlashAttribute("successMessage", "Job updated successfully!");
        return "redirect:/employer/jobs";
    }

    @PostMapping("/jobs/{id}/toggle")
    public String toggleJobStatus(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails,
                                  RedirectAttributes redirectAttributes) {
        jobService.toggleJobStatus(id, getCurrentUser(userDetails));
        redirectAttributes.addFlashAttribute("successMessage", "Job status updated.");
        return "redirect:/employer/jobs";
    }

    @PostMapping("/jobs/{id}/delete")
    public String deleteJob(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails,
                            RedirectAttributes redirectAttributes) {
        User employer = getCurrentUser(userDetails);
        Job job = jobService.findById(id);
        if (job.getEmployer().getId().equals(employer.getId())) {
            jobService.deleteJob(id);
            redirectAttributes.addFlashAttribute("successMessage", "Job deleted successfully.");
        }
        return "redirect:/employer/jobs";
    }

    @GetMapping("/jobs/{id}/applicants")
    public String viewApplicants(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, Model model) {
        User employer = getCurrentUser(userDetails);
        Job job = jobService.findById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) return "redirect:/employer/jobs";
        model.addAttribute("job", job);
        model.addAttribute("applications", applicationService.getApplicationsByJob(job));
        return "employer/applicants";
    }

    @PostMapping("/applications/{id}/status")
    public String updateApplicationStatus(@PathVariable Long id,
                                          @RequestParam ApplicationStatus status,
                                          @AuthenticationPrincipal UserDetails userDetails,
                                          RedirectAttributes redirectAttributes) {
        User employer = getCurrentUser(userDetails);
        Application application = applicationService.findById(id);
        applicationService.updateStatus(id, status, employer);
        redirectAttributes.addFlashAttribute("successMessage", "Application marked as " + status.name().toLowerCase() + ".");
        return "redirect:/employer/jobs/" + application.getJob().getId() + "/applicants";
    }

    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        model.addAttribute("employer", getCurrentUser(userDetails));
        return "employer/profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                @RequestParam String name, @RequestParam String phone,
                                @RequestParam(required = false) String company,
                                RedirectAttributes redirectAttributes) {
        User employer = getCurrentUser(userDetails);
        employer.setName(name);
        employer.setPhone(phone);
        if (company != null && !company.isBlank()) employer.setCompany(company);
        userService.updateProfile(employer);
        redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
        return "redirect:/employer/profile";
    }
}
