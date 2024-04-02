package com.spark.controller;

import com.spark.config.service.ModuleService;
import com.spark.config.service.ProductService;
import com.spark.config.service.TeamService;
import com.spark.config.service.UserService;
import com.spark.dto.ModuleRepository;
import com.spark.dto.TeamRepository;
import com.spark.dto.UserRepository;
import com.spark.entities.Module;
import com.spark.entities.Product;
import com.spark.entities.Roles;
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
import java.util.List;
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
    @Autowired
    private ProductService productService;
    @Autowired
    private ModuleService moduleService;

    @Autowired
    private UserService userService;
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
        Pageable pageable = PageRequest.of(page, 10);
        Page<Team> teams = teamService.getAllTeams(pageable);
        model.addAttribute("teams", teams);
        return "admin/teams";
    }

    @RequestMapping(value = "/do_add_team", method = RequestMethod.POST)
    public String doAddTeam(@ModelAttribute("team") Team team, Model model, Principal principal, HttpSession session) {
        String username = principal.getName();
        User user = userRepository.getUserByUsername(username);
        team.setUsers(Set.of(user));
        model.addAttribute("user", new User());
        session.setAttribute("message", new Message("Team added successfully!", "success"));
        teamRepository.save(team);
        return "redirect:/admin/addTeam";
    }
    @GetMapping("/products")
    public String getProductsPage(Model model, @RequestParam(defaultValue = "0") int page) {
        Page<Product> products = productService.getProducts(PageRequest.of(page, 10));
        model.addAttribute("products", products);
        return "admin/products";
    }
    @RequestMapping(value = "/addProduct")
    public String addProduct(Model model, Principal principal){
        model.addAttribute("title", "Add Product");
        model.addAttribute("product", new Product());
        String username = principal.getName();
        User user= userRepository.getUserByUsername(username);
        model.addAttribute("user", user);
        List<User> admins = userRepository.findByRole(Roles.ROLE_ADMIN); // fetch only users with ROLE_ADMIN
        model.addAttribute("admins", admins);
        return "admin/addProduct";
    }
    @RequestMapping(value = "/do_add_product", method = RequestMethod.POST)
    public String doAddProduct(@ModelAttribute("product") Product product, Model model, Principal principal, HttpSession session) {
        try{
            productService.saveProduct(product);
            model.addAttribute("product",new Product());
            session.setAttribute("message", new Message("Product added successfully!", "success"));
            return "redirect:/admin/addProduct";
        }catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("product", product);
            session.setAttribute("message", new Message("Product couldn't be added!", "danger"));
            return "admin/addProduct";
        }
    }

    @RequestMapping(value = "/addModule")
    public String showAddModuleForm(Model model) {
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE); // get all users
        Page<User> usersPage = userService.getAllUsers(pageable);

        Page<Product> productPage = productService.getProducts(pageable);
        List<Product> products = productPage.getContent();

        Page<Team> teamPage = teamService.getAllTeams(pageable);
        List<Team> teams = teamPage.getContent();
        model.addAttribute("module", new com.spark.entities.Module());
        model.addAttribute("teams", teams);
        model.addAttribute("products", products);
        List<User> admins = userRepository.findByRole(Roles.ROLE_ADMIN); // fetch only users with ROLE_ADMIN
        model.addAttribute("users", admins);
        return "admin/addModule";
    }

    @PostMapping("/do_add_module")
    public String addModule(@ModelAttribute("module") Module module,Model model,Principal principal, HttpSession session) {
        try{
            moduleService.saveModule(module);
            model.addAttribute("module",new Module());
            session.setAttribute("message", new Message("Module added successfully!", "success"));
            return "redirect:/admin/addModule";
        }catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("module", module);
            session.setAttribute("message", new Message("Module couldn't be added!", "danger"));
            return "redirect:/admin/addModule";
        }
    }

    @GetMapping("/modules")
    public String showModulesPage(Model model, @RequestParam(defaultValue = "0") int page) {
        Page<Module> modulesPage = moduleService.getAllModules(PageRequest.of(page, 10));
        model.addAttribute("modules", modulesPage);
        return "admin/modules";
    }
}
