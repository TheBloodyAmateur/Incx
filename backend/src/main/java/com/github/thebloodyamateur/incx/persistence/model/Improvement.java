package com.github.thebloodyamateur.incx.persistence.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "improvements")
public class Improvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_name", nullable = false)
    private String pageName;

    @Column(name = "ui_name")
    private String uiName;

    @Column(name = "ui_type")
    private String uiType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "improvement_proposal", columnDefinition = "TEXT")
    private String improvementProposal;

    @Column(name = "improvement_component", columnDefinition = "TEXT")
    private String improvementComponent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}