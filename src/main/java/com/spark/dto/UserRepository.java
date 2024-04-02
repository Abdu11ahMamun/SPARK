package com.spark.dto;

import com.spark.entities.User;
import com.spark.entities.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("select u from User u where u.username = :username")
    public User getUserByUsername(@Param("username") String username);

    @Query("select u from User u where u.role = :role")
    public List<User> findByRole(@Param("role") Roles role);
}
