package com.github.thebloodyamateur.incx.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.github.thebloodyamateur.incx.persistence.model.Improvement;
import com.github.thebloodyamateur.incx.persistence.repository.ImprovementRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ImprovementService {

    private final ImprovementRepository improvementRepository;

    public List<Improvement> getImprovementsByPage(String pageName) {
        return improvementRepository.findByPageName(pageName);
    }

    public List<Improvement> getAllImprovements() {
        return improvementRepository.findAll();
    }
}