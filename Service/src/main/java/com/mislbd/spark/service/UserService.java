package com.mislbd.spark.service;

import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.types.Roles;
import com.mislbd.spark.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Cacheable("users")
    public List<User> getAllUsers() {
        // This will NOT load the memberships due to LAZY loading
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#id")
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public User saveUser(User user) {
        // Preserve existing password if updating and password is null/blank
        if (user.getId() != null) {
            Optional<User> existingOpt = userRepository.findById(user.getId());
            if (existingOpt.isPresent()) {
                User existing = existingOpt.get();
                if (user.getPassword() == null || user.getPassword().isBlank()) {
                    user.setPassword(existing.getPassword());
                }
            }
        }
        // Encode password if provided in plain text
        if (user.getPassword() != null && !user.getPassword().isBlank() && !isBCrypt(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    private boolean isBCrypt(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    // Method to get user with memberships only when needed
    public Optional<User> getUserWithMemberships(Long id) {
        return userRepository.findByIdWithMemberships(id);
    }

    // Additional user management methods
    public List<User> getUsersByRole(Roles role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByStatus(String status) {
        return userRepository.findByActiveStatus(status);
    }

    public List<User> searchUsers(String searchTerm) {
        return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm, searchTerm
        );
    }
}
