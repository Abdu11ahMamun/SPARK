package com.mislbd.spark.service;

import com.mislbd.spark.dto.TeamMemberDto;
import com.mislbd.spark.dto.TeamDto;
import com.mislbd.spark.entity.*;
import com.mislbd.spark.exception.DuplicateMembershipException;
import com.mislbd.spark.exception.MembershipNotFoundException;
import com.mislbd.spark.repository.TeamMembershipRepository;
import com.mislbd.spark.repository.TeamRepository;
import com.mislbd.spark.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeamMembershipService {
    
    private final TeamMembershipRepository teamMembershipRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Autowired
    public TeamMembershipService(TeamMembershipRepository teamMembershipRepository, 
                                TeamRepository teamRepository, 
                                UserRepository userRepository) {
        this.teamMembershipRepository = teamMembershipRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    public List<TeamMemberDto> getTeamMembers(Integer teamId) {
        List<TeamMembership> memberships = teamMembershipRepository.findByTeamId(teamId);
        return memberships.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public int getTeamMemberCount(Integer teamId) {
        Long count = teamMembershipRepository.countByTeamId(teamId);
        return count != null ? count.intValue() : 0;
    }

    public List<TeamDto> getUserTeams(Long userId) {
        List<TeamMembership> memberships = teamMembershipRepository.findByUserId(userId);
        return memberships.stream()
                .map(membership -> convertTeamToDto(membership.getTeam()))
                .collect(Collectors.toList());
    }

    private TeamDto convertTeamToDto(Team team) {
        TeamDto dto = new TeamDto();
        dto.setId(team.getId());
        dto.setTeamName(team.getTeamName());
        dto.setDescription(team.getDescription());
        dto.setStatus(team.getStatus());
        dto.setPOwner(team.getPOwner());
        dto.setSMaster(team.getSMaster());
        dto.setCreatedAt(team.getCreatedAt());
        if (team.getUpdatedAt() != null) {
            dto.setUpdatedAt(team.getUpdatedAt());
        }
        return dto;
    }

    public TeamMemberDto addTeamMember(Integer teamId, Integer userId, String role) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if membership already exists
        TeamMembershipId membershipId = new TeamMembershipId(Long.valueOf(userId), teamId);
        if (teamMembershipRepository.existsById(membershipId)) {
            throw new DuplicateMembershipException("User is already a member of this team");
        }

        TeamMembership membership = TeamMembership.builder()
                .id(membershipId)
                .user(user)
                .team(team)
                .teamRole(role)
                .build();

        TeamMembership saved = teamMembershipRepository.save(membership);
        return convertToDto(saved);
    }

    public TeamMemberDto updateTeamMemberRole(Integer teamId, Integer userId, String role) {
        TeamMembershipId membershipId = new TeamMembershipId(Long.valueOf(userId), teamId);
        TeamMembership membership = teamMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new MembershipNotFoundException("Team membership not found"));

        membership.setTeamRole(role);
        TeamMembership updated = teamMembershipRepository.save(membership);
        return convertToDto(updated);
    }

    public void removeTeamMember(Integer teamId, Integer userId) {
        TeamMembershipId membershipId = new TeamMembershipId(Long.valueOf(userId), teamId);
        if (!teamMembershipRepository.existsById(membershipId)) {
            throw new MembershipNotFoundException("Team membership not found");
        }
        teamMembershipRepository.deleteById(membershipId);
    }

    private TeamMemberDto convertToDto(TeamMembership membership) {
        User user = membership.getUser();
        String fullName = buildFullName(user.getFirstName(), user.getMiddleName(), user.getLastName());
        
        return TeamMemberDto.builder()
                .id(user.getId().intValue())
                .userId(user.getId().intValue())
                .teamId(membership.getTeam().getId())
                .userName(fullName)
                .userEmail(user.getEmail())
                .role(membership.getTeamRole())
                .joinedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build();
    }

    private String buildFullName(String firstName, String middleName, String lastName) {
        StringBuilder fullName = new StringBuilder();
        if (firstName != null && !firstName.trim().isEmpty()) {
            fullName.append(firstName.trim());
        }
        if (middleName != null && !middleName.trim().isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(middleName.trim());
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(lastName.trim());
        }
        return fullName.toString();
    }
}
