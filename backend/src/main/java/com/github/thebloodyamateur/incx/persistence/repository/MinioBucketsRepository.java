package com.github.thebloodyamateur.incx.persistence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.github.thebloodyamateur.incx.persistence.model.MinioBucket;


public interface MinioBucketsRepository extends JpaRepository<MinioBucket, Long> {
    void deleteByUserId(Long userId);
    @Query("SELECT b FROM MinioBucket b WHERE b.name = :bucketName")
    Optional<MinioBucket> findByBucketName(String bucketName);
}