package com.github.thebloodyamateur.incx.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.github.thebloodyamateur.incx.persistence.model.MinioBucket;
import com.github.thebloodyamateur.incx.persistence.model.MinioObject;

public interface MinioObjectsRepository extends JpaRepository<MinioObject, Long> {
    @Query(value =
        "WITH RECURSIVE folder_contents AS (" +
        "  SELECT id, name, type, parent_id, minio_path FROM objects WHERE id = :folderId" +
        "  UNION ALL" +
        "  SELECT o.id, o.name, o.type, o.parent_id, o.minio_path FROM objects o" +
        "  JOIN folder_contents fc ON o.parent_id = fc.id" +
        ") SELECT * FROM folder_contents WHERE type = 'FILE'",
        nativeQuery = true)
    List<MinioObject> findFilesInFolder(@Param("folderId") Long folderId);

    @Query("SELECT o FROM MinioObject o WHERE o.minioBucket = :minioBucket AND o.name = :name")
    Optional<MinioObject> findByMinioBucketAndName(MinioBucket minioBucket, String name);
    
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
       "FROM MinioObject o " +
       "WHERE o.minioBucket = :minioBucket " +
       "AND o.name = :pathName " +
       "AND o.type = 'FOLDER' " +
       "AND EXISTS (SELECT 1 FROM MinioObject c WHERE c.parent = o)")
    boolean folderExistsAndIsNotEmpty(@Param("minioBucket") MinioBucket minioBucket, @Param("pathName") String pathName);

}
