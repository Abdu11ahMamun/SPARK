package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.TEAM_MEMBERSHIP_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMembership {
    @EmbeddedId
    private TeamMembershipId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    private Team team;

    private String teamRole;
}
