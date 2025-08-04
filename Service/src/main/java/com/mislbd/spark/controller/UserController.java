package com.mislbd.spark.controller;

import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.types.Roles;
import com.mislbd.spark.service.UserService;
import com.mislbd.spark.service.TeamMembershipService;
import com.mislbd.spark.dto.TeamDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TeamMembershipService teamMembershipService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        // Set creation timestamp
        user.setCreatedate(LocalDateTime.now());
        user.setUpdatedate(LocalDateTime.now());
        
        // Set default status if not provided
        if (user.getActiveStatus() == null) {
            user.setActiveStatus("ACTIVE");
        }
        
        return userService.saveUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.getUserById(id)
                .map(existing -> {
                    user.setId(id);
                    user.setCreatedate(existing.getCreatedate()); // Preserve creation date
                    user.setUpdatedate(LocalDateTime.now()); // Update modification date
                    return ResponseEntity.ok(userService.saveUser(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    userService.deleteUser(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Additional user management endpoints
    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        try {
            Roles roleEnum = Roles.valueOf(role.toUpperCase());
            return userService.getUsersByRole(roleEnum);
        } catch (IllegalArgumentException e) {
            return List.of(); // Return empty list for invalid role
        }
    }

    @GetMapping("/status/{status}")
    public List<User> getUsersByStatus(@PathVariable String status) {
        return userService.getUsersByStatus(status.toUpperCase());
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    user.setActiveStatus("ACTIVE");
                    user.setUpdatedate(LocalDateTime.now());
                    return ResponseEntity.ok(userService.saveUser(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    user.setActiveStatus("INACTIVE");
                    user.setUpdatedate(LocalDateTime.now());
                    return ResponseEntity.ok(userService.saveUser(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    // In a real application, you would:
                    // 1. Generate a temporary password or reset token
                    // 2. Send email to user with reset instructions
                    // 3. Update password reset timestamp
                    
                    // For now, just return success
                    user.setUpdatedate(LocalDateTime.now());
                    userService.saveUser(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get teams for a specific user
    @GetMapping("/{userId}/teams")
    public ResponseEntity<List<TeamDto>> getUserTeams(@PathVariable Long userId) {
        List<TeamDto> userTeams = teamMembershipService.getUserTeams(userId);
        return ResponseEntity.ok(userTeams);
    }
}
