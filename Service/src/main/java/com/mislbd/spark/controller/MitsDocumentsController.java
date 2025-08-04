package com.mislbd.spark.controller;

import com.mislbd.spark.dto.MitsDocumentsDto;
import com.mislbd.spark.entity.MitsDocuments;
import com.mislbd.spark.mapper.MitsDocumentsMapper;
import com.mislbd.spark.service.MitsDocumentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mits-documents")
public class MitsDocumentsController {
    private final MitsDocumentsService mitsDocumentsService;
    private final MitsDocumentsMapper mitsDocumentsMapper;

    @Autowired
    public MitsDocumentsController(MitsDocumentsService mitsDocumentsService, MitsDocumentsMapper mitsDocumentsMapper) {
        this.mitsDocumentsService = mitsDocumentsService;
        this.mitsDocumentsMapper = mitsDocumentsMapper;
    }

    @GetMapping
    public List<MitsDocumentsDto> getAllMitsDocuments() {
        return mitsDocumentsService.getAllMitsDocuments().stream().map(mitsDocumentsMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MitsDocumentsDto> getMitsDocumentsById(@PathVariable Integer id) {
        return mitsDocumentsService.getMitsDocumentsById(id)
                .map(mitsDocumentsMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MitsDocumentsDto createMitsDocuments(@RequestBody MitsDocumentsDto mitsDocumentsDto) {
        MitsDocuments mitsDocuments = mitsDocumentsMapper.toEntity(mitsDocumentsDto);
        return mitsDocumentsMapper.toDto(mitsDocumentsService.saveMitsDocuments(mitsDocuments));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MitsDocumentsDto> updateMitsDocuments(@PathVariable Integer id, @RequestBody MitsDocumentsDto mitsDocumentsDto) {
        return mitsDocumentsService.getMitsDocumentsById(id)
                .map(existing -> {
                    mitsDocumentsDto.setId(id);
                    MitsDocuments updated = mitsDocumentsService.saveMitsDocuments(mitsDocumentsMapper.toEntity(mitsDocumentsDto));
                    return ResponseEntity.ok(mitsDocumentsMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMitsDocuments(@PathVariable Integer id) {
        if (mitsDocumentsService.getMitsDocumentsById(id).isPresent()) {
            mitsDocumentsService.deleteMitsDocuments(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
