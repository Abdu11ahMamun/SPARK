package com.spark.entities;

import com.spark.enums.*;
import jakarta.persistence.*;
import java.util.List;
import  com.spark.entities.Module;
import java.util.Set;
@Entity
@Table(name = "BACKLOG")
public class Backlog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;

    private String releaseVersion;

    private String description;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Enumerated(EnumType.STRING)
    private SourceReference sourceReference;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private Integer storySize;

//    private Integer estimatedTime;

    private String remarks;

    @OneToMany
    @JoinColumn(name = "document_id")
    private List<Documents> attachments;

    @ManyToMany
    @JoinTable(
            name = "task_dependencies",
            joinColumns = @JoinColumn(name = "backlog_id"),
            inverseJoinColumns = @JoinColumn(name = "dependency_id")
    )
    private Set<Backlog> dependencies;


    @ManyToMany(mappedBy = "backlogs")
    private List<Sprint> sprints;

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

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Module getModule() {
        return module;
    }

    public void setModule(Module module) {
        this.module = module;
    }

    public String getReleaseVersion() {
        return releaseVersion;
    }

    public void setReleaseVersion(String releaseVersion) {
        this.releaseVersion = releaseVersion;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public SourceReference getSourceReference() {
        return sourceReference;
    }

    public void setSourceReference(SourceReference sourceReference) {
        this.sourceReference = sourceReference;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Integer getStorySize() {
        return storySize;
    }

    public void setStorySize(Integer storySize) {
        this.storySize = storySize;
    }

//    public Integer getEstimatedTime() {
//        return estimatedTime;
//    }
//
//    public void setEstimatedTime(Integer estimatedTime) {
//        this.estimatedTime = estimatedTime;
//    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<Documents> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Documents> attachments) {
        this.attachments = attachments;
    }

    public Set<Backlog> getDependencies() {
        return dependencies;
    }

    public void setDependencies(Set<Backlog> dependencies) {
        this.dependencies = dependencies;
    }

    public List<Sprint> getSprints() {
        return sprints;
    }

    public void setSprints(List<Sprint> sprints) {
        this.sprints = sprints;
    }
}
