package com.mislbd.spark.service;

import com.mislbd.spark.entity.MitsDocuments;
import com.mislbd.spark.repository.MitsDocumentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MitsDocumentsService {
    private final MitsDocumentsRepository mitsDocumentsRepository;

    @Autowired
    public MitsDocumentsService(MitsDocumentsRepository mitsDocumentsRepository) {
        this.mitsDocumentsRepository = mitsDocumentsRepository;
    }

    public List<MitsDocuments> getAllMitsDocuments() {
        return mitsDocumentsRepository.findAll();
    }

    public Optional<MitsDocuments> getMitsDocumentsById(Integer id) {
        return mitsDocumentsRepository.findById(id);
    }

    public MitsDocuments saveMitsDocuments(MitsDocuments mitsDocuments) {
        return mitsDocumentsRepository.save(mitsDocuments);
    }

    public void deleteMitsDocuments(Integer id) {
        mitsDocumentsRepository.deleteById(id);
    }
}
