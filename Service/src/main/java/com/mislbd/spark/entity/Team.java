package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "TEAM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    private Long id;

    @Column(name = "TEAMNAME", nullable = false)
    private String teamname;

    private String description;

    private LocalDateTime createdat;
    private LocalDateTime updatedat;

    private Integer status;

    @ManyToMany
    @JoinTable(
            name = "USER_TEAM",
            joinColumns = @JoinColumn(name = "USER_ID"),
            inverseJoinColumns = @JoinColumn(name = "TEAM_ID")
    )
    private List<Team> teams;

}
