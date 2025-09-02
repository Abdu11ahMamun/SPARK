package com.mislbd.spark.service;

import com.mislbd.spark.entity.Sprint;
import com.mislbd.spark.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class SprintService {
    private final SprintRepository sprintRepository;

    @Autowired
    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Optional<Sprint> getSprintById(Integer id) {
        return sprintRepository.findById(id);
    }

    public List<Sprint> getSprintsByTeam(Integer teamId) {
        return sprintRepository.findByTeamId(teamId);
    }

    public List<Sprint> getSprintsByStatus(String status) {
        return sprintRepository.findByStatus(status);
    }

    public List<Sprint> getActiveSprints() {
        return sprintRepository.findByIsActiveTrue();
    }

    public Sprint saveSprint(Sprint sprint) {
        // Calculate sprint days if not provided
        if (sprint.getTotalSprintDays() == null && sprint.getStartDate() != null && sprint.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate()) + 1;
            sprint.setTotalSprintDays((int) days);
        }
        
        // Set timestamps if new
        if (sprint.getId() == null) {
            sprint.setCreatedDate(LocalDate.now());
        }
        sprint.setModifiedDate(LocalDate.now());
        
        return sprintRepository.save(sprint);
    }

    public void deleteSprint(Integer id) {
        sprintRepository.deleteById(id);
    }
}
