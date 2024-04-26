package com.spark.entities;

import jakarta.persistence.*;

import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.Set;

@Entity
@Table(name="USER")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    @NotBlank(message = "Name is required")
    private String name;
  //  @NotBlank(message = "Username is required")

    @Column(unique = true)
    private String username;
  //  @NotBlank(message = "Email is required")

    @Column(unique = true)
    private String email;
  //  @NotBlank(message = "Password is required")
    private String password;

    @Enumerated(EnumType.STRING)
    private Roles role;

    private boolean activeStatus;

    private String imageUrl;


    private String contactNumber;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_team",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id"))
    private Set<Team> teams;

    @OneToMany(mappedBy = "productOwner", cascade = CascadeType.ALL)
    private Set<Product> products;

    public Set<Product> getProducts() {
        return products;
    }

    public void setProducts(Set<Product> products) {
        this.products = products;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }



    public User() {
        super();
    }

    public int getId() {
        return id;
    }

    public Set<Team> getTeams() {
        return teams;
    }

    public void setTeams(Set<Team> teams) {
        this.teams = teams;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Roles getRole() {
        return role;
    }

    public void setRole(Roles role) {
        this.role = role;
    }

    public boolean isActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(boolean activeStatus) {
        this.activeStatus = activeStatus;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    private String teamsString;

    public String getTeamsString() {
        return teamsString;
    }

    public void setTeamsString(String teamsString) {
        this.teamsString = teamsString;
    }
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role=" + role +
                ", activeStatus=" + activeStatus +
                ", imageUrl='" + imageUrl + '\'' +
                ", contactNumber='" + contactNumber + '\'' +
                ", teams=" + teams +
                '}';
    }
}
