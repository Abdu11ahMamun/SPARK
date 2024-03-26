package com.spark.controller;

import com.spark.dto.UserRepository;
import com.spark.entities.Roles;
import com.spark.entities.User;
import com.spark.helper.Message;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;

@Controller
public class HomeController {
    @Autowired
    private UserRepository userRepository;
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
        return "addUser";
    }

    @RequestMapping(value = "/do_add_user", method = RequestMethod.POST)
    public String doAddUser(@Valid @ModelAttribute("user") User user, Model model, HttpSession session) {
       try {
//           if (bindingResult.hasErrors()){
//               model.addAttribute("user",user);
//               return "addUser";
//           }
           //System.out.println("USER: " + user);
           user.setRole(Roles.ADMIN);
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