package com.spark.config.service;

import com.spark.entities.SprintTask;
import com.spark.dto.SprintTaskRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class SprintTaskService {
    private final SprintTaskRepository sprintTaskRepository;

    @Autowired
    public SprintTaskService(SprintTaskRepository sprintTaskRepository) {
        this.sprintTaskRepository = sprintTaskRepository;
    }


    public List<SprintTask> getSprintTasksBySprintIdWithBacklogDetails(Long sprintId) {
        return sprintTaskRepository.findBySprintIdWithBacklogDetails(sprintId);
    }


    public List<SprintTask> searchSprintTasks(Long sprintId, Map<String, String> searchParams) {
        Specification<SprintTask> spec = new Specification<SprintTask>() {
            @Override
            public Predicate toPredicate(Root<SprintTask> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
                List<Predicate> predicates = new ArrayList<>();

                // Add predicates for each search parameter
                for (Map.Entry<String, String> entry : searchParams.entrySet()) {
                    if (root.get(entry.getKey()) != null && entry.getValue() != null) {
                        predicates.add(criteriaBuilder.like(root.get(entry.getKey()), "%" + entry.getValue() + "%"));
                    }
                }

                // Add predicate for sprintId
                predicates.add(criteriaBuilder.equal(root.get("sprintId"), sprintId));

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            }
        };

        return sprintTaskRepository.findAll(spec);
    }
}