package com.mislbd.spark.controller;

import com.mislbd.spark.dto.TaskCommentDto;
import com.mislbd.spark.entity.TaskComment;
import com.mislbd.spark.mapper.TaskCommentMapper;
import com.mislbd.spark.service.TaskCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskCommentController {

    private final TaskCommentService service;
    private final TaskCommentMapper mapper;

    @Autowired
    public TaskCommentController(TaskCommentService service, TaskCommentMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/{taskId}/comments")
    public List<TaskCommentDto> list(@PathVariable Integer taskId) {
        return service.getComments(taskId).stream().map(mapper::toDto).collect(Collectors.toList());
    }

    static class AddRequest { public String commentText; public Integer authorUserId; }

    @PostMapping("/{taskId}/comments")
    public ResponseEntity<TaskCommentDto> add(@PathVariable Integer taskId, @RequestBody AddRequest req) {
        if (req == null || req.commentText == null || req.commentText.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TaskComment saved = service.addComment(taskId, req.commentText.trim(), req.authorUserId);
        return ResponseEntity.ok(mapper.toDto(saved));
    }
}
