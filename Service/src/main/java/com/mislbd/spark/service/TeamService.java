package com.mislbd.spark.service;

import com.mislbd.spark.entity.Team;
import com.mislbd.spark.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TeamService {
    private final TeamRepository teamRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Cacheable("teams")
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Cacheable(value = "teams", key = "#id")
    public Optional<Team> getTeamById(Integer id) {
        return teamRepository.findById(id);
    }

    @Transactional
    @CacheEvict(value = "teams", allEntries = true)
    public Team saveTeam(Team team) {
        return teamRepository.save(team);
    }

    @Transactional
    @CacheEvict(value = "teams", allEntries = true)
    public void deleteTeam(Integer id) {
        teamRepository.deleteById(id);
    }
}
