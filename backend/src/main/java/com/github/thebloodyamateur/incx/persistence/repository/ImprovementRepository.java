package com.github.thebloodyamateur.incx.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.github.thebloodyamateur.incx.persistence.model.Improvement;

@Repository
public interface ImprovementRepository extends JpaRepository<Improvement, Long> {
    
    // Findet alle Improvements für eine spezifische Seite (z.B. "BookingPage")
    List<Improvement> findByPageName(String pageName);
}