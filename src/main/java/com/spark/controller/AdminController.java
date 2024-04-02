package com.spark.controller;

import com.spark.config.service.TeamService;
import com.spark.config.service.UserService;
import com.spark.dto.TeamRepository;
import com.spark.dto.UserRepository;
import com.spark.helper.Message;
import com.spark.entities.Team;
import com.spark.entities.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Set;

@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private TeamService teamService;
    @RequestMapping("/index")
    public String dashboard(Model model, Principal principal) {
        String username = principal.getName();
        User user= userRepository.getUserByUsername(username);
        model.addAttribute(user);
        return "admin/dashboard";
    }

    @RequestMapping("/addTeam")
    public String addTeam(Model model) {
        model.addAttribute("team", new Team());
        return "admin/addTeam";
    }

    @GetMapping("/teams")
    public String getAllTeams(Model model, @RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 2);
        Page<Team> teams = teamService.getAllTeams(pageable);
        model.addAttribute("teams", teams);
        return "admin/teams";
    }

    @RequestMapping(value = "/do_add_team", method = RequestMethod.POST)
    public String doAddTeam(@ModelAttribute("team") Team team, Model model, Principal principal, HttpSession session) {
        String username = principal.getName();
        User user = userRepository.getUserByUsername(username);
        team.setUsers(Set.of(user));
        session.setAttribute("message", new Message("Team added successfully!", "success"));
        teamRepository.save(team);
        return "redirect:/admin/index";
    }
}
