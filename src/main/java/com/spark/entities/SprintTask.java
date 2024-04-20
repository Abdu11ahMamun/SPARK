package com.spark.entities;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SPRINT_TASK")
public class SprintTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "assigned_person_id")
    private User assignedPerson;

    private Integer timeEstimate;

    private Integer storySize;

    private Integer completedPoints;

    private Integer completedHours;

    public Integer getCompletedHours() {
        return completedHours;
    }

    public void setCompletedHours(Integer completedHours) {
        this.completedHours = completedHours;
    }

    @Temporal(TemporalType.DATE)
    private Date dateOfDone;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;
    @ManyToOne
    @JoinColumn(name = "backlog_id")
    private Backlog backlog;

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

    public User getAssignedPerson() {
        return assignedPerson;
    }

    public void setAssignedPerson(User assignedPerson) {
        this.assignedPerson = assignedPerson;
    }

    public Integer getTimeEstimate() {
        return timeEstimate;
    }

    public void setTimeEstimate(Integer timeEstimate) {
        this.timeEstimate = timeEstimate;
    }

    public Integer getStorySize() {
        return storySize;
    }

    public void setStorySize(Integer storySize) {
        this.storySize = storySize;
    }

    public Integer getCompletedPoints() {
        return completedPoints;
    }

    public void setCompletedPoints(Integer completedPoints) {
        this.completedPoints = completedPoints;
    }

    public Date getDateOfDone() {
        return dateOfDone;
    }

    public void setDateOfDone(Date dateOfDone) {
        this.dateOfDone = dateOfDone;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public Backlog getBacklog() {
        return backlog;
    }

    public void setBacklog(Backlog backlog) {
        this.backlog = backlog;
    }
}