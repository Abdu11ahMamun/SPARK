package com.spark.entities;
import com.spark.enums.SprintStatus;
import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "SPRINT")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date startingDate;

    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date endingDate;
    @ManyToOne
    @JoinColumn(name = "backlog_id")
    private Backlog backlog;

    @Enumerated(EnumType.STRING)
    private SprintStatus sprintStatus;

//    @OneToMany
//    @JoinTable(
//            name = "sprint_backlog",
//            joinColumns = @JoinColumn(name = "sprint_id"),
//            inverseJoinColumns = @JoinColumn(name = "backlog_id")
//    )
//    private List<Backlog> backlogs;

//    @OneToMany(mappedBy = "sprint")
//    private List<Backlog> backlogs;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
    public Date getStartingDate() {
        return startingDate;
    }

    public void setStartingDate(Date startingDate) {
        this.startingDate = startingDate;
    }

    public Date getEndingDate() {
        return endingDate;
    }

    public void setEndingDate(Date endingDate) {
        this.endingDate = endingDate;
    }

    public Backlog getBacklog() {
        return backlog;
    }

    public void setBacklog(Backlog backlog) {
        this.backlog = backlog;
    }

    public SprintStatus getSprintStatus() {
        return sprintStatus;
    }

    public void setSprintStatus(SprintStatus sprintStatus) {
        this.sprintStatus = sprintStatus;
    }
//    public List<Backlog> getBacklogs() {
//        return backlogs;
//    }
//
//    public void setBacklogs(List<Backlog> backlogs) {
//        this.backlogs = backlogs;
//    }
}
