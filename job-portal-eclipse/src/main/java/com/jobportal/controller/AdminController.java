package com.jobportal.controller;

import com.jobportal.model.*;
import com.jobportal.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final JobService jobService;
    private final ApplicationService applicationService;

    @Autowired
    public AdminController(UserService userService, JobService jobService, ApplicationService applicationService) {
        this.userService = userService;
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("totalStudents", userService.countByRole(Role.STUDENT));
        model.addAttribute("totalEmployers", userService.countByRole(Role.EMPLOYER));
        model.addAttribute("activeJobs", jobService.countActiveJobs());
        model.addAttribute("totalApplications", applicationService.countAllApplications());
        model.addAttribute("recentJobs", jobService.getAllJobs().stream().limit(5).toList());
        model.addAttribute("recentUsers", userService.getAllUsers().stream().limit(5).toList());
        return "admin/dashboard";
    }

    @GetMapping("/users")
    public String manageUsers(Model model) {
        model.addAttribute("users", userService.getAllUsers());
        return "admin/users";
    }

    @PostMapping("/users/{id}/toggle")
    public String toggleUserStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        userService.toggleUserStatus(id);
        redirectAttributes.addFlashAttribute("successMessage", "User status updated.");
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        userService.deleteUser(id);
        redirectAttributes.addFlashAttribute("successMessage", "User deleted successfully.");
        return "redirect:/admin/users";
    }

    @GetMapping("/jobs")
    public String manageJobs(Model model) {
        model.addAttribute("jobs", jobService.getAllJobs());
        return "admin/jobs";
    }

    @PostMapping("/jobs/{id}/delete")
    public String deleteJob(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        jobService.deleteJob(id);
        redirectAttributes.addFlashAttribute("successMessage", "Job deleted successfully.");
        return "redirect:/admin/jobs";
    }

    @PostMapping("/jobs/{id}/toggle")
    public String toggleJob(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        Job job = jobService.findById(id);
        job.setStatus(job.getStatus() == JobStatus.ACTIVE ? JobStatus.CLOSED : JobStatus.ACTIVE);
        jobService.saveJob(job);
        redirectAttributes.addFlashAttribute("successMessage", "Job status updated.");
        return "redirect:/admin/jobs";
    }

    @GetMapping("/applications")
    public String viewAllApplications(Model model) {
        model.addAttribute("totalApplications", applicationService.countAllApplications());
        return "admin/dashboard";
    }
}
