package com.spark.controller;

import com.spark.config.service.UserService;
import com.spark.dto.TeamRepository;
import com.spark.dto.UserRepository;
import com.spark.entities.Team;
import com.spark.entities.User;
import com.spark.helper.Message;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class
HomeController {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private UserService userService;
    @RequestMapping(value = "/")
    public String home(Model model) {
        model.addAttribute("title", "Spark");
        return "home";
    }

    @RequestMapping(value = "/login")
    public String login(Model model) {
        model.addAttribute("title", "Login");
        return "login";
    }
    @RequestMapping(value = "/addUser")
    public String addUser(Model model) {
        model.addAttribute("title", "Add User");
        model.addAttribute("user", new User());
        model.addAttribute("teams", teamRepository.findAll());
        return "addUser";
    }
    @RequestMapping(value = "/testing")
    public String testing(Model model) {
        model.addAttribute("title", "Add User");
        model.addAttribute("user", new User());
        return "devtesting";
    }

    @GetMapping("/users")
    public String getAllUsers(Model model, @RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 5);
        Page<User> users = userService.getAllUsers(pageable);
        for (User user : users) {
            String teams = user.getTeams().stream()
                    .map(Team::getName)
                    .collect(Collectors.joining(", "));
            user.setTeamsString(teams);
        }
        model.addAttribute("users", users);
        return "users";
    }
    @RequestMapping(value = "/do_add_user", method = RequestMethod.POST)
    public String doAddUser(@Valid @ModelAttribute("user") User user, Model model, HttpSession session) {
       try {
           user.setPassword(passwordEncoder.encode(user.getPassword()));
           User result = this.userRepository.save(user);
           model.addAttribute("user", new User());
           session.setAttribute("message",new Message("Data Save Successfully","alert-success"));
           return "addUser";
       }catch (Exception e){
            e.printStackTrace();
            model.addAttribute("user", user);
            session.setAttribute("message",new Message("Database Save couldn't be possible"+e.getMessage(),"alert-denger"));
            return "addUser";

       }
    }
}

//1. Server side validation need to be implemented