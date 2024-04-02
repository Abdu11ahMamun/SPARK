package com.spark.controller;

import com.spark.dto.UserRepository;
import com.spark.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @RequestMapping("/index")
    public String dashboard(Model model, Principal principal) {
        String username = principal.getName();
        User user= userRepository.getUserByUsername(username);
        model.addAttribute(user);
        return "common/dashboard";
    }
}
