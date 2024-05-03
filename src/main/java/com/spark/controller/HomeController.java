package com.spark.controller;

import com.spark.config.service.*;
import com.spark.dto.SprintTaskRepository;
import com.spark.dto.TeamRepository;
import com.spark.dto.UserRepository;
import com.spark.entities.*;
import com.spark.entities.Module;
import com.spark.helper.Message;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
public class
HomeController {
//    @Autowired
//    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private UserService userService;

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private BacklogService backlogService;
    @Autowired
    private TeamService teamService;
    @Autowired
    private ProductService productService;
    @Autowired
    private ClientService clientService;

    @Autowired
    private SprintService sprintService;

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
          // user.setPassword(passwordEncoder.encode(user.getPassword()));
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

    @GetMapping("/addBacklog")
    public String showAddBacklogForm(Model model) {
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE); // get all users
        Page<User> usersPage = userService.getAllUsers(pageable);
        List<User> users = usersPage.getContent();
        Page<Module> modulesPage = moduleService.getAllModules(pageable);
        List<Module> modules = modulesPage.getContent();
        //List<Backlog> backlogs = backlogService.getAllBacklogs();


        model.addAttribute("users", users);
        model.addAttribute("modules", modules);
        model.addAttribute("backlog", new Backlog());
        model.addAttribute("teams", teamRepository.findAll());
        model.addAttribute("clients", clientService.getAllClients());
        return "addBacklog";
    }

//    @PostMapping("/do_add_backlog")
//    public String addBacklog(@ModelAttribute Backlog backlog, @RequestParam("attachments") List<MultipartFile> attachments) {
//        backlogService.addBacklog(backlog, attachments);
//        return "redirect:/backlogs";
//    }
        @PostMapping("/do_add_backlog")
        public String addBacklog(@ModelAttribute Backlog backlog) {
            backlogService.addBacklog(backlog);
            return "redirect:/backlogs";
        }

        @GetMapping("/backlogs")
        public String getAllBacklogs(Model model, @RequestParam(defaultValue = "0") int page) {
            Pageable pageable = PageRequest.of(page, 10);
            Page<Backlog> backlogs = backlogService.getAllBacklogs(pageable);

            Page<Team> teamPage = teamService.getAllTeams(pageable);
            List<Team> teams = teamPage.getContent();

            Page<Product> productPage = productService.getProducts(pageable);
            List<Product> products = productPage.getContent();
            Page<Sprint> sprints = sprintService.getAllSprints(pageable);

            model.addAttribute("backlogs", backlogs);
            model.addAttribute("module", new com.spark.entities.Module());
            model.addAttribute("teams", teams);
            model.addAttribute("products", products);
            model.addAttribute("clients", clientService.getAllClients());
            model.addAttribute("sprints", sprints.getContent());
            return "backlogs";
        }
        @GetMapping("/sprints")
        public String getAllSprints(Model model, @RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 10);
        Page<Sprint> sprints = sprintService.getAllSprints(pageable);
        model.addAttribute("sprints", sprints);
        return "sprints";
        }
    @GetMapping("/api/sprints")
    @ResponseBody
    public List<Sprint> getSprintsJson(@RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 10);
        Page<Sprint> sprints = sprintService.getAllSprints(pageable);
        return sprints.getContent();
    }

//    @PostMapping("/api/sprints/{sprintId}/assign-backlogs")
//    @ResponseBody
//    public void assignBacklogsToSprint(@PathVariable Long sprintId, @RequestBody List<Long> backlogIds) {
//        sprintService.assignBacklogsToSprint(backlogIds, sprintId);
//    }
    @PostMapping("/api/sprints/{sprintId}/assign-backlogs")
    @ResponseBody
    public void assignBacklogsToSprint(@PathVariable Long sprintId, @RequestBody List<Long> backlogIds) {
        sprintService.assignBacklogsToSprint(backlogIds, sprintId);
    }
    @GetMapping("/addSprint")
    public String showAddSprintForm(Model model) {
        List<Team> teams = teamRepository.findAll();
        model.addAttribute("teams", teams);
        model.addAttribute("sprint", new Sprint());
        return "addSprint";
    }

        @PostMapping("/admin/do_add_sprint")
        public String addSprint(@ModelAttribute Sprint sprint, HttpSession session) {
            try {
                sprintService.addSprint(sprint);
                session.setAttribute("message", new Message("Sprint added successfully", "alert-success"));
            } catch (Exception e) {
                session.setAttribute("message", new Message("Error while adding sprint: " + e.getMessage(), "alert-danger"));
            }
            return "redirect:/addSprint";
        }

        @Autowired
        private SprintTaskRepository sprintTaskRepository;
        @Autowired
        private SprintTaskService sprintTaskService;


    @GetMapping("/sprintTasks/{sprintId}")
    public String getSprintTasks(@PathVariable("sprintId") Long sprintId, Model model) {
        List<SprintTask> sprintTasks = sprintTaskService.getSprintTasksBySprintIdWithBacklogDetails(sprintId);
        model.addAttribute("tasks", sprintTasks);
        Sprint sprint = sprintService.getSprintById(sprintId);
        Long teamId = (long) sprint.getTeam().getTeamId();
        Team team = sprint.getTeam();
        Set<User> teamMembers = teamService.getMembers(team.getTeamId());
        model.addAttribute("teamId", teamId);
        model.addAttribute("teamMembers", teamMembers);
        return "sprintTasks";
    }



}

//1. Server side validation need to be implemented