package com.spark.config.service;


import com.spark.entities.Backlog;
import com.spark.dto.BacklogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class BacklogService {

    @Autowired
    private BacklogRepository backlogRepository;
   // public void addBacklog(Backlog backlog, List<MultipartFile> attachments) {

    public void addBacklog(Backlog backlog) {

        backlogRepository.save(backlog);
    }
//    public List<Backlog> getAllBacklogs() {
//        return backlogRepository.findAll();
//    }
    public Page<Backlog> getAllBacklogs(Pageable pageable) {
        return backlogRepository.findAll(pageable);
    }
}