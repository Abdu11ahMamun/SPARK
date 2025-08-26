package com.mislbd.spark.controller;

import com.mislbd.spark.dto.BacklogTaskDto;
import com.mislbd.spark.entity.BacklogTask;
import com.mislbd.spark.mapper.BacklogTaskMapper;
import com.mislbd.spark.service.BacklogTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final BacklogTaskService backlogTaskService;
    private final BacklogTaskMapper backlogTaskMapper;

    // Map task type string to ID
    private static final Map<String, Integer> TASK_TYPE_TO_ID = new HashMap<>();
    static {
        TASK_TYPE_TO_ID.put("FEATURE", 1);
        TASK_TYPE_TO_ID.put("BUG", 2);
        TASK_TYPE_TO_ID.put("IMPROVEMENT", 3);
        TASK_TYPE_TO_ID.put("DOCUMENTATION", 4);
        TASK_TYPE_TO_ID.put("RESEARCH", 5);
        TASK_TYPE_TO_ID.put("TESTING", 6);
    }

    // Map task type ID to string
    private static final Map<Integer, String> ID_TO_TASK_TYPE = new HashMap<>();
    static {
        ID_TO_TASK_TYPE.put(1, "FEATURE");
        ID_TO_TASK_TYPE.put(2, "BUG");
        ID_TO_TASK_TYPE.put(3, "IMPROVEMENT");
        ID_TO_TASK_TYPE.put(4, "DOCUMENTATION");
        ID_TO_TASK_TYPE.put(5, "RESEARCH");
        ID_TO_TASK_TYPE.put(6, "TESTING");
    }

    @Autowired
    public TaskController(BacklogTaskService backlogTaskService, BacklogTaskMapper backlogTaskMapper) {
        this.backlogTaskService = backlogTaskService;
        this.backlogTaskMapper = backlogTaskMapper;
    }

    @GetMapping
    public List<BacklogTaskDto> getAllTasks() {
        List<BacklogTaskDto> tasks = backlogTaskService.getAllBacklogTasks().stream()
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());

        // Map task type ID to string for frontend compatibility
        tasks.forEach(task -> {
            if (task.getTasktypeid() != null) {
                String typeString = ID_TO_TASK_TYPE.get(task.getTasktypeid());
                if (typeString != null) {
                        // Use setTaskType(Integer) instead of setType(String)
                        task.setTaskType(task.getTasktypeid());
                }
            }
        });

        return tasks;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacklogTaskDto> getTaskById(@PathVariable Integer id) {
        return backlogTaskService.getBacklogTaskById(id)
                .map(task -> {
                    BacklogTaskDto dto = backlogTaskMapper.toDto(task);
                    // Map task type ID to string
                    if (dto.getTasktypeid() != null) {
                        String typeString = ID_TO_TASK_TYPE.get(dto.getTasktypeid());
                        if (typeString != null) {
                            dto.setTaskType(dto.getTasktypeid());
                        }
                    }

                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BacklogTaskDto createTask(@RequestBody BacklogTaskDto taskDto) {
        // Set creation timestamp
        taskDto.setCreateddate(Instant.now());
        taskDto.setModifieddate(Instant.now());

        // Map string type to taskType ID for backend compatibility
        if (taskDto.getTaskType() != null) {
            Integer typeId = taskDto.getTaskType();
            taskDto.setTasktypeid(typeId);
        } else {
            taskDto.setTasktypeid(1); // Default to FEATURE
        }

        BacklogTask backlogTask = backlogTaskMapper.toEntity(taskDto);
        BacklogTask savedTask = backlogTaskService.saveBacklogTask(backlogTask);
        BacklogTaskDto result = backlogTaskMapper.toDto(savedTask);

        // Map back to string for frontend compatibility
        if (result.getTasktypeid() != null) {
            String typeString = ID_TO_TASK_TYPE.get(result.getTasktypeid());
            if (typeString != null) {
                result.setTaskType(result.getTasktypeid());
            } else {
                result.setTaskType(1); // Default to FEATURE ID
            }
        } else {
            result.setTaskType(1); // Default to FEATURE ID
        }

        return result;
    }

    @PutMapping("/{id}")
    public ResponseEntity<BacklogTaskDto> updateTask(@PathVariable Integer id, @RequestBody BacklogTaskDto taskDto) {
        return backlogTaskService.getBacklogTaskById(id)
                .map(existing -> {
                    taskDto.setId(id);
                    taskDto.setModifieddate(Instant.now());
                    // Preserve creation date
                    taskDto.setCreateddate(existing.getCreateddate());

                    // Map string type to taskType ID for backend compatibility
                    if (taskDto.getTaskType() != null) {
                        Integer typeId = taskDto.getTaskType();
                        taskDto.setTasktypeid(typeId);
                    } else {
                        taskDto.setTasktypeid(1); // Default to FEATURE
                    }

                    BacklogTask updated = backlogTaskService.saveBacklogTask(backlogTaskMapper.toEntity(taskDto));
                    BacklogTaskDto result = backlogTaskMapper.toDto(updated);

                    // Map back to string for frontend compatibility
                    if (result.getTasktypeid() != null) {
                        String typeString = ID_TO_TASK_TYPE.get(result.getTasktypeid());
                        if (typeString != null) {
                            result.setTaskType(result.getTasktypeid());
                        } else {
                            result.setTaskType(1); // Default to FEATURE ID
                        }
                    } else {
                        result.setTaskType(1); // Default to FEATURE ID
                    }

                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        if (backlogTaskService.getBacklogTaskById(id).isPresent()) {
            backlogTaskService.deleteBacklogTask(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Additional endpoints for task management with filtering
    @GetMapping("/by-module/{moduleId}")
    public List<BacklogTaskDto> getTasksByModule(@PathVariable Integer moduleId) {
        List<BacklogTaskDto> tasks = backlogTaskService.getAllBacklogTasks().stream()
                .filter(task -> task.getProductModuleId() != null && task.getProductModuleId().equals(moduleId))
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());

        // Map for frontend compatibility
        tasks.forEach(task -> {
            // Map task type
            if (task.getTasktypeid() != null) {
                String typeString = ID_TO_TASK_TYPE.get(task.getTasktypeid());
                if (typeString != null) {
                    task.setTaskType(task.getTasktypeid());
                }
            }
        });

        return tasks;
    }

    @GetMapping("/by-sprint/{sprintId}")
    public List<BacklogTaskDto> getTasksBySprint(@PathVariable Integer sprintId) {
        List<BacklogTaskDto> tasks = backlogTaskService.getAllBacklogTasks().stream()
                .filter(task -> task.getSprintid() != null && task.getSprintid().equals(sprintId))
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());

        // Map for frontend compatibility
        tasks.forEach(task -> {
            // Map task type
            if (task.getTasktypeid() != null) {
                String typeString = ID_TO_TASK_TYPE.get(task.getTasktypeid());
                if (typeString != null) {
                    task.setTaskType(task.getTasktypeid());
                }
            }
        });

        return tasks;
    }

    /**
     * Compatibility alias for frontend calling /api/tasks/sprint/{sprintId}
     * (original endpoint was /api/tasks/by-sprint/{sprintId}).
     * Consider deprecating once frontend adjusted.
     */
    @GetMapping("/sprint/{sprintId}")
    public List<BacklogTaskDto> getTasksBySprintAlias(@PathVariable Integer sprintId) {
        return getTasksBySprint(sprintId);
    }

    @GetMapping("/by-assignee/{assigneeId}")
    public List<BacklogTaskDto> getTasksByAssignee(@PathVariable Integer assigneeId) {
        List<BacklogTaskDto> tasks = backlogTaskService.getAllBacklogTasks().stream()
                .filter(task -> task.getAssignedto() != null && task.getAssignedto().equals(assigneeId))
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());

        // Map for frontend compatibility
        tasks.forEach(task -> {
            // Map task type
            if (task.getTasktypeid() != null) {
                String typeString = ID_TO_TASK_TYPE.get(task.getTasktypeid());
                if (typeString != null) {
                    task.setTaskType(task.getTasktypeid());
                }
            }
        });

        return tasks;
    }

    @GetMapping("/search")
    public List<BacklogTaskDto> searchTasks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Integer moduleId,
            @RequestParam(required = false) Integer sprintId,
            @RequestParam(required = false) Integer assigneeId) {

        List<BacklogTaskDto> tasks = backlogTaskService.getAllBacklogTasks().stream()
                .filter(task -> title == null || task.getTitle().toLowerCase().contains(title.toLowerCase()))
                .filter(task -> status == null || status.equals(task.getStatus()))
                .filter(task -> priority == null || priority.equals(task.getPriority()))
                .filter(task -> moduleId == null || (task.getProductModuleId() != null && task.getProductModuleId().equals(moduleId)))
                .filter(task -> sprintId == null || (task.getSprintid() != null && task.getSprintid().equals(sprintId)))
                .filter(task -> assigneeId == null || (task.getAssignedto() != null && task.getAssignedto().equals(assigneeId)))
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());

        // Map for frontend compatibility
        tasks.forEach(task -> {
            // Map task type
            if (task.getTasktypeid() != null) {
                String typeString = ID_TO_TASK_TYPE.get(task.getTasktypeid());
                if (typeString != null) {
                    task.setTaskType(task.getTasktypeid());
                }
            }
        });

        return tasks;
    }
}
