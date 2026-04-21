package com.jobportal.controller;

import com.jobportal.model.*;
import com.jobportal.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/student")
public class StudentController {

    private final UserService userService;
    private final JobService jobService;
    private final ApplicationService applicationService;

    @Autowired
    public StudentController(UserService userService, JobService jobService, ApplicationService applicationService) {
        this.userService = userService;
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername());
    }

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User student = getCurrentUser(userDetails);
        List<Application> applications = applicationService.getApplicationsByStudent(student);
        long totalApplied = applications.size();
        long shortlisted = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
        long pending = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.PENDING).count();
        long rejected = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();
        model.addAttribute("student", student);
        model.addAttribute("totalApplied", totalApplied);
        model.addAttribute("shortlisted", shortlisted);
        model.addAttribute("pending", pending);
        model.addAttribute("rejected", rejected);
        model.addAttribute("recentApplications", applications.stream().limit(5).toList());
        model.addAttribute("activeJobs", jobService.getAllActiveJobs().size());
        return "student/dashboard";
    }

    @GetMapping("/jobs")
    public String browseJobs(@RequestParam(required = false) String keyword,
                             @AuthenticationPrincipal UserDetails userDetails, Model model) {
        User student = getCurrentUser(userDetails);
        List<Job> jobs = (keyword != null && !keyword.isBlank())
                ? jobService.searchJobs(keyword) : jobService.getAllActiveJobs();
        List<Long> appliedJobIds = applicationService.getApplicationsByStudent(student)
                .stream().map(a -> a.getJob().getId()).toList();
        model.addAttribute("jobs", jobs);
        model.addAttribute("appliedJobIds", appliedJobIds);
        model.addAttribute("keyword", keyword);
        return "student/jobs";
    }

    @GetMapping("/jobs/{id}")
    public String viewJob(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, Model model) {
        User student = getCurrentUser(userDetails);
        Job job = jobService.findById(id);
        model.addAttribute("job", job);
        model.addAttribute("hasApplied", applicationService.hasApplied(job, student));
        return "student/job-detail";
    }

    @PostMapping("/jobs/{id}/apply")
    public String applyForJob(@PathVariable Long id,
                              @RequestParam(required = false) String coverLetter,
                              @AuthenticationPrincipal UserDetails userDetails,
                              RedirectAttributes redirectAttributes) {
        User student = getCurrentUser(userDetails);
        Job job = jobService.findById(id);
        try {
            applicationService.applyForJob(job, student, coverLetter);
            redirectAttributes.addFlashAttribute("successMessage", "Application submitted successfully!");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/student/applications";
    }

    @GetMapping("/applications")
    public String myApplications(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User student = getCurrentUser(userDetails);
        model.addAttribute("applications", applicationService.getApplicationsByStudent(student));
        return "student/applications";
    }

    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        model.addAttribute("student", getCurrentUser(userDetails));
        return "student/profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                @RequestParam String name,
                                @RequestParam String phone,
                                @RequestParam(required = false) String resumeSummary,
                                RedirectAttributes redirectAttributes) {
        User student = getCurrentUser(userDetails);
        student.setName(name);
        student.setPhone(phone);
        student.setResumeSummary(resumeSummary);
        userService.updateProfile(student);
        redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
        return "redirect:/student/profile";
    }
}
