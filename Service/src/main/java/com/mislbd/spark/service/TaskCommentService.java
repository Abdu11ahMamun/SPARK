
package com.mislbd.spark.service;

import com.mislbd.spark.entity.TaskComment;
import com.mislbd.spark.repository.TaskCommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskCommentService {

    private final TaskCommentRepository repository;

    @Autowired
    public TaskCommentService(TaskCommentRepository repository) {
        this.repository = repository;
    }

    public List<TaskComment> getComments(Integer taskId) {
        return repository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    public TaskComment addComment(Integer taskId, String text, Integer authorUserId) {
        TaskComment c = TaskComment.builder()
                .taskId(taskId)
                .commentText(text)
                .authorUserId(authorUserId)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(c);
    }
}
