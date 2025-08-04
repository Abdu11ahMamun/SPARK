package com.mislbd.spark.controller;

import com.mislbd.spark.dto.TeamDto;
import com.mislbd.spark.dto.TeamMemberDto;
import com.mislbd.spark.dto.CreateTeamMemberRequest;
import com.mislbd.spark.dto.UpdateTeamMemberRoleRequest;
import com.mislbd.spark.entity.Team;
import com.mislbd.spark.entity.TeamMembership;
import com.mislbd.spark.mapper.TeamMapper;
import com.mislbd.spark.service.TeamService;
import com.mislbd.spark.service.TeamMembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    private final TeamService teamService;
    private final TeamMapper teamMapper;
    private final TeamMembershipService teamMembershipService;

    @Autowired
    public TeamController(TeamService teamService, TeamMapper teamMapper, TeamMembershipService teamMembershipService) {
        this.teamService = teamService;
        this.teamMapper = teamMapper;
        this.teamMembershipService = teamMembershipService;
    }

    @GetMapping
    public List<TeamDto> getAllTeams() {
        return teamService.getAllTeams().stream().map(teamMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDto> getTeamById(@PathVariable Integer id) {
        return teamService.getTeamById(id)
                .map(teamMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TeamDto createTeam(@RequestBody TeamDto teamDto) {
        Team team = teamMapper.toEntity(teamDto);
        return teamMapper.toDto(teamService.saveTeam(team));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDto> updateTeam(@PathVariable Integer id, @RequestBody TeamDto teamDto) {
        return teamService.getTeamById(id)
                .map(existing -> {
                    teamDto.setId(id);
                    Team updated = teamService.saveTeam(teamMapper.toEntity(teamDto));
                    return ResponseEntity.ok(teamMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Integer id) {
        if (teamService.getTeamById(id).isPresent()) {
            teamService.deleteTeam(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Team member management endpoints
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembers(@PathVariable Integer teamId) {
        List<TeamMemberDto> members = teamMembershipService.getTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{teamId}/members/count")
    public ResponseEntity<Integer> getTeamMemberCount(@PathVariable Integer teamId) {
        int count = teamMembershipService.getTeamMemberCount(teamId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMemberDto> addTeamMember(@PathVariable Integer teamId, @RequestBody CreateTeamMemberRequest request) {
        TeamMemberDto member = teamMembershipService.addTeamMember(teamId, request.getUserId(), request.getRole());
        return ResponseEntity.ok(member);
    }

    @PutMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<TeamMemberDto> updateTeamMemberRole(@PathVariable Integer teamId, @PathVariable Integer memberId, @RequestBody UpdateTeamMemberRoleRequest request) {
        TeamMemberDto member = teamMembershipService.updateTeamMemberRole(teamId, memberId, request.getRole());
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<Void> removeTeamMember(@PathVariable Integer teamId, @PathVariable Integer memberId) {
        teamMembershipService.removeTeamMember(teamId, memberId);
        return ResponseEntity.noContent().build();
    }
}
