package com.mislbd.spark.service;

import com.mislbd.spark.dto.*;
import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.entity.SprintUserCapacity;
import com.mislbd.spark.entity.User;
import com.mislbd.spark.repository.SprintInfoRepository;
import com.mislbd.spark.repository.SprintUserCapacityRepository;
import com.mislbd.spark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for Sprint Capacity Management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SprintCapacityService {

    private final SprintUserCapacityRepository capacityRepository;
    private final SprintInfoRepository sprintInfoRepository;
    private final UserRepository userRepository;
    private final TeamMembershipService teamMembershipService;

    /**
     * Create sprint with capacity planning
     */
    @Transactional
    public SprintInfo createSprintWithCapacity(SprintCreationDto sprintDto) {
        log.info("Creating sprint with capacity planning: {}", sprintDto.getSprintName());

        // Calculate sprint duration
        int sprintDurationDays = calculateSprintDuration(sprintDto.getFromDate(), sprintDto.getToDate());
        sprintDto.setSprintDurationDays(sprintDurationDays);

        // Create Sprint Info
        SprintInfo sprintInfo = SprintInfo.builder()
                .sprintName(sprintDto.getSprintName())
                .fromDate(sprintDto.getFromDate())
                .toDate(sprintDto.getToDate())
                .tramId(sprintDto.getTramId())
                .sprintPoint(sprintDto.getSprintPoint())
                .detailsRemark(sprintDto.getDetailsRemark())
                .createBy(sprintDto.getCreateBy())
                .noOfHolidays(sprintDto.getNoOfHolidays() != null ? sprintDto.getNoOfHolidays() : 0)
                .status(0) // Planning phase
                .build();

        sprintInfo = sprintInfoRepository.save(sprintInfo);
        log.info("Sprint created with ID: {}", sprintInfo.getId());

        // Create user capacities
        if (sprintDto.getUserCapacities() != null && !sprintDto.getUserCapacities().isEmpty()) {
            createUserCapacities(sprintInfo.getId(), sprintDto.getUserCapacities(), sprintDurationDays);
        }

        return sprintInfo;
    }

    /**
     * Add or update user capacity for a sprint
     */
    @Transactional
    public SprintUserCapacityDto addOrUpdateUserCapacity(Integer sprintId, SprintUserCapacityDto capacityDto) {
        log.info("Adding/updating user capacity for sprint {} and user {}", sprintId, capacityDto.getUserId());

        // Validate sprint exists
        SprintInfo sprint = sprintInfoRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found with ID: " + sprintId));

        // Validate user exists
        User user = userRepository.findById(capacityDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + capacityDto.getUserId()));

        // Calculate sprint duration
        int sprintDurationDays = calculateSprintDuration(sprint.getFromDate(), sprint.getToDate());

        // Find existing capacity or create new
        SprintUserCapacity capacity = capacityRepository.findBySprintIdAndUserId(sprintId, capacityDto.getUserId())
                .orElse(SprintUserCapacity.builder()
                        .sprintId(sprintId)
                        .userId(capacityDto.getUserId())
                        .userName(user.getFirstName() + " " + user.getLastName())
                        .build());

        // Update capacity data
        updateCapacityFromDto(capacity, capacityDto);
        // capacity.calculateAvailableHours(sprintDurationDays);
        capacity.calculateAvailableHours(sprintDurationDays);

        capacity = capacityRepository.save(capacity);
        log.info("User capacity saved with ID: {}", capacity.getId());

        return convertToDto(capacity);
    }

    /**
     * Get all user capacities for a sprint
     */
    public List<SprintUserCapacityDto> getSprintUserCapacities(Integer sprintId) {
        List<SprintUserCapacity> capacities = capacityRepository.findBySprintIdAndStatus(sprintId, 1);
        return capacities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get sprint capacity summary
     */
    public SprintCapacitySummaryDto getSprintCapacitySummary(Integer sprintId) {
        log.info("Calculating sprint capacity summary for sprint ID: {}", sprintId);

        // Get sprint info
        SprintInfo sprint = sprintInfoRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found with ID: " + sprintId));

        // Get all user capacities
        List<SprintUserCapacity> capacities = capacityRepository.findBySprintIdAndStatus(sprintId, 1);

        if (capacities.isEmpty()) {
            return createEmptySummary(sprint);
        }

        return calculateCapacitySummary(sprint, capacities);
    }

    /**
     * Remove user from sprint
     */
    @Transactional
    public void removeUserFromSprint(Integer sprintId, Long userId) {
        log.info("Removing user {} from sprint {}", userId, sprintId);
        
        Optional<SprintUserCapacity> capacity = capacityRepository.findBySprintIdAndUserId(sprintId, userId);
        if (capacity.isPresent()) {
            capacityRepository.delete(capacity.get());
            log.info("User capacity removed successfully");
        }
    }

    /**
     * Update user allocation hours
     */
    @Transactional
    public SprintUserCapacityDto updateUserAllocation(Integer sprintId, Long userId, BigDecimal allocatedHours) {
        SprintUserCapacity capacity = capacityRepository.findBySprintIdAndUserId(sprintId, userId)
                .orElseThrow(() -> new RuntimeException("User capacity not found"));

        capacity.setAllocatedHours(allocatedHours);
        capacity.setRemainingHours(capacity.getAvailableWorkingHours().subtract(allocatedHours));
        
        capacity = capacityRepository.save(capacity);
        return convertToDto(capacity);
    }

    /**
     * Get team members by team ID for sprint planning
     */
    public List<TeamMemberDto> getTeamMembers(Integer teamId) {
        log.info("Getting team members for team ID: {}", teamId);
        
        try {
            // Get team members using TeamMembershipService
            return teamMembershipService.getTeamMembers(teamId);
        } catch (Exception e) {
            log.error("Error getting team members for team {}: {}", teamId, e.getMessage());
            throw new RuntimeException("Failed to get team members for team: " + teamId, e);
        }
    }

    // Private helper methods

    private void createUserCapacities(Integer sprintId, List<SprintUserCapacityDto> capacityDtos, int sprintDurationDays) {
        for (SprintUserCapacityDto dto : capacityDtos) {
            // Validate user exists
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

            SprintUserCapacity capacity = SprintUserCapacity.builder()
                    .sprintId(sprintId)
                    .userId(dto.getUserId())
                    .userName(user.getFirstName() + " " + user.getLastName())
                    .userCapacityPercentage(dto.getUserCapacityPercentage() != null ? 
                            dto.getUserCapacityPercentage() : BigDecimal.valueOf(100))
                    .leaveDays(dto.getLeaveDays() != null ? dto.getLeaveDays() : 0)
                    .dailyWorkingHours(dto.getDailyWorkingHours() != null ? 
                            dto.getDailyWorkingHours() : BigDecimal.valueOf(8))
                    .allocatedHours(BigDecimal.ZERO)
                    .notes(dto.getNotes())
                    .createdBy(dto.getCreatedBy())
                    .status(1)
                    .build();

            capacity.calculateAvailableHours(sprintDurationDays);
            capacityRepository.save(capacity);
        }
    }

    private void updateCapacityFromDto(SprintUserCapacity capacity, SprintUserCapacityDto dto) {
        if (dto.getUserCapacityPercentage() != null) {
            capacity.setUserCapacityPercentage(dto.getUserCapacityPercentage());
        }
        if (dto.getLeaveDays() != null) {
            capacity.setLeaveDays(dto.getLeaveDays());
        }
        if (dto.getDailyWorkingHours() != null) {
            capacity.setDailyWorkingHours(dto.getDailyWorkingHours());
        }
        if (dto.getAllocatedHours() != null) {
            capacity.setAllocatedHours(dto.getAllocatedHours());
        }
        if (dto.getNotes() != null) {
            capacity.setNotes(dto.getNotes());
        }
        if (dto.getUpdatedBy() != null) {
            capacity.setUpdatedBy(dto.getUpdatedBy());
        }
        capacity.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
    }

    private SprintUserCapacityDto convertToDto(SprintUserCapacity capacity) {
        return SprintUserCapacityDto.builder()
                .id(capacity.getId())
                .sprintId(capacity.getSprintId())
                .userId(capacity.getUserId())
                .userName(capacity.getUserName())
                .userCapacityPercentage(capacity.getUserCapacityPercentage())
                .leaveDays(capacity.getLeaveDays())
                .dailyWorkingHours(capacity.getDailyWorkingHours())
                .totalWorkingHours(capacity.getTotalWorkingHours())
                .availableWorkingHours(capacity.getAvailableWorkingHours())
                .allocatedHours(capacity.getAllocatedHours())
                .remainingHours(capacity.getRemainingHours())
                .status(capacity.getStatus())
                .notes(capacity.getNotes())
                .createdBy(capacity.getCreatedBy())
                .createdTime(capacity.getCreatedTime())
                .updatedBy(capacity.getUpdatedBy())
                .updatedTime(capacity.getUpdatedTime())
                .utilizationPercentage(capacity.getUtilizationPercentage())
                .isOverAllocated(capacity.isOverAllocated())
                .build();
    }

    private int calculateSprintDuration(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(fromDate, toDate) + 1;
    }

    /**
     * Helper method to convert Instant to LocalDate for sprint duration calculation
     */
    private int calculateSprintDurationFromInstant(Instant fromDate, Instant toDate) {
        if (fromDate == null || toDate == null) {
            return 0;
        }
        LocalDate fromLocalDate = fromDate.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate toLocalDate = toDate.atZone(ZoneOffset.UTC).toLocalDate();
        return calculateSprintDuration(fromLocalDate, toLocalDate);
    }

    private SprintCapacitySummaryDto createEmptySummary(SprintInfo sprint) {
        int sprintDuration = calculateSprintDuration(sprint.getFromDate(), sprint.getToDate());

        return SprintCapacitySummaryDto.builder()
                .totalTeamMembers(0)
                .activeMembers(0)
                .membersOnLeave(0)
                .totalCapacityHours(BigDecimal.ZERO)
                .totalAllocatedHours(BigDecimal.ZERO)
                .totalRemainingHours(BigDecimal.ZERO)
                .averageUtilization(BigDecimal.ZERO)
                .totalPotentialHours(BigDecimal.ZERO)
                .totalLostHoursToLeave(BigDecimal.ZERO)
                .totalLostHoursToCapacity(BigDecimal.ZERO)
                .totalLeaveDays(0)
                .teamEfficiency(BigDecimal.ZERO)
                .overAllocatedMembers(0)
                .underUtilizedMembers(0)
                .hasCapacityRisks(false)
                .sprintDurationDays(sprintDuration)
                .workingDays(sprintDuration - (sprint.getNoOfHolidays() != null ? sprint.getNoOfHolidays() : 0))
                .holidays(sprint.getNoOfHolidays() != null ? sprint.getNoOfHolidays() : 0)
                .build();
    }

    private SprintCapacitySummaryDto calculateCapacitySummary(SprintInfo sprint, List<SprintUserCapacity> capacities) {
        int sprintDuration = calculateSprintDuration(sprint.getFromDate(), sprint.getToDate());

        // Basic counts
        int totalMembers = capacities.size();
        int membersWithLeave = (int) capacities.stream().filter(c -> c.getLeaveDays() > 0).count();
        
        // Hour calculations
        BigDecimal totalPotentialHours = capacities.stream()
                .map(SprintUserCapacity::getTotalWorkingHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalAvailableHours = capacities.stream()
                .map(SprintUserCapacity::getAvailableWorkingHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalAllocatedHours = capacities.stream()
                .map(c -> c.getAllocatedHours() != null ? c.getAllocatedHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalRemainingHours = totalAvailableHours.subtract(totalAllocatedHours);
        
        // Lost hours calculations
        BigDecimal totalLostToLeave = totalPotentialHours.subtract(totalAvailableHours);
        
        // Utilization and efficiency
        BigDecimal averageUtilization = totalAvailableHours.compareTo(BigDecimal.ZERO) > 0 ?
                totalAllocatedHours.multiply(BigDecimal.valueOf(100))
                .divide(totalAvailableHours, 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                
        BigDecimal teamEfficiency = totalPotentialHours.compareTo(BigDecimal.ZERO) > 0 ?
                totalAvailableHours.multiply(BigDecimal.valueOf(100))
                .divide(totalPotentialHours, 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // Risk indicators
        int overAllocatedMembers = (int) capacities.stream().filter(SprintUserCapacity::isOverAllocated).count();
        int underUtilizedMembers = (int) capacities.stream()
                .filter(c -> c.getUtilizationPercentage().compareTo(BigDecimal.valueOf(70)) < 0).count();
                
        // Total leave days
        int totalLeaveDays = capacities.stream().mapToInt(SprintUserCapacity::getLeaveDays).sum();
        
        return SprintCapacitySummaryDto.builder()
                .totalTeamMembers(totalMembers)
                .activeMembers(totalMembers)
                .membersOnLeave(membersWithLeave)
                .totalCapacityHours(totalAvailableHours)
                .totalAllocatedHours(totalAllocatedHours)
                .totalRemainingHours(totalRemainingHours)
                .averageUtilization(averageUtilization)
                .totalPotentialHours(totalPotentialHours)
                .totalLostHoursToLeave(totalLostToLeave)
                .totalLostHoursToCapacity(totalPotentialHours.subtract(totalAvailableHours))
                .totalLeaveDays(totalLeaveDays)
                .teamEfficiency(teamEfficiency)
                .overAllocatedMembers(overAllocatedMembers)
                .underUtilizedMembers(underUtilizedMembers)
                .hasCapacityRisks(overAllocatedMembers > 0 || underUtilizedMembers > 0)
                .sprintDurationDays(sprintDuration)
                .workingDays(sprintDuration - (sprint.getNoOfHolidays() != null ? sprint.getNoOfHolidays() : 0))
                .holidays(sprint.getNoOfHolidays() != null ? sprint.getNoOfHolidays() : 0)
                .build();
    }
}
