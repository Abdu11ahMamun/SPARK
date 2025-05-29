package com.mislbd.spark.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class TeamMembership {

    @EmbeddedId
    private TeamMembershipId id;

    @ManyToOne
    @MapsId("userId")
    private User user;

    @ManyToOne
    @MapsId("teamId")
    private Team team;

    private String teamRole;
}
