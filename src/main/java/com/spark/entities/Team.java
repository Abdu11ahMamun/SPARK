package com.spark.entities;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "TEAM")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int teamId;
    @Column(unique = true)
    private String name;

    private String slogan;
    @Column(length = 250)
    private String description;

    @ManyToMany(mappedBy = "teams", cascade = CascadeType.ALL)
    private Set<User> users;

    public Team() {
        super();
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlogan() {
        return slogan;
    }

    public void setSlogan(String slogan) {
        this.slogan = slogan;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}
