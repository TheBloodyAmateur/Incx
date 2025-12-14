package com.github.thebloodyamateur.incx.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.github.thebloodyamateur.incx.persistence.model.Improvement;
import com.github.thebloodyamateur.incx.service.ImprovementService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/improvements")
@AllArgsConstructor
@Slf4j(topic = "ImprovementController")
public class ImprovementController {

    private final ImprovementService improvementService;

    @GetMapping
    public List<Improvement> getImprovements(@RequestParam(required = false) String page) {
        if (page != null) {
            log.info("Fetching improvements for page: {}", page);
            return improvementService.getImprovementsByPage(page);
        }
        log.info("Fetching all improvements");
        return improvementService.getAllImprovements();
    }
}