package com.mislbd.spark.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMembershipId implements Serializable {
    private Long userId;
    private Integer teamId;
}
