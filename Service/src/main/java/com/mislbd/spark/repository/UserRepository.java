package com.mislbd.spark.repository;

import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.types.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    
    // Optimized query to fetch user with memberships only when needed
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.memberships m LEFT JOIN FETCH m.team WHERE u.id = :id")
    Optional<User> findByIdWithMemberships(@Param("id") Long id);

    // Additional query methods for user management
    List<User> findByRole(Roles role);
    List<User> findByActiveStatus(String activeStatus);
    
    // Search methods
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String firstName, String lastName, String username, String email
    );
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchByTerm(@Param("searchTerm") String searchTerm);
}
