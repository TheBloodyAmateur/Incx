package com.github.thebloodyamateur.incx.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.github.thebloodyamateur.incx.dto.GeneralResponse;
import com.github.thebloodyamateur.incx.service.FileService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("files")
@Slf4j(topic = "FileController")
@AllArgsConstructor
public class FileController {
    private FileService fileService;

    @DeleteMapping("bucket/name/{bucketname}")
    public ResponseEntity<GeneralResponse> deleteBucketByName(@PathVariable String bucketname) {
        boolean isDeleted = fileService.deleteBucket(bucketname);
        if (isDeleted) {
            log.info("Bucket '{}' deleted successfully.", bucketname);
            return ResponseEntity.ok(new GeneralResponse("Bucket deleted successfully."));
        } else {
            log.error("Failed to delete bucket '{}'.", bucketname);
            return ResponseEntity.status(500).body(new GeneralResponse("Failed to delete bucket."));
        }
    }

    @DeleteMapping("bucket/id/{id}")
    public ResponseEntity<GeneralResponse> deleteBucketById(@PathVariable Long id) {
        boolean isDeleted = fileService.deleteBucketById(id);
        if (isDeleted) {
            log.info("Bucket with ID '{}' deleted successfully.", id);
            return ResponseEntity.ok(new GeneralResponse("Bucket deleted successfully."));
        } else {
            log.error("Failed to delete bucket with ID '{}'.", id);
            return ResponseEntity.status(500).body(new GeneralResponse("Failed to delete bucket."));
        }
    }

    @PostMapping(value = "upload", consumes = "multipart/form-data")
    public ResponseEntity<GeneralResponse> createFile(
        @RequestParam MultipartFile fileData,
        @RequestParam String fileName,
        @RequestParam String bucketName)
    {
        log.info("Received file upload request for file: " + fileName + " to bucket: " + bucketName);
        return fileService.uploadFile(fileData, fileName, bucketName);
    }

    @DeleteMapping("delete")
    public ResponseEntity<GeneralResponse> deleteFile(
        @RequestParam String fileName,
        @RequestParam String bucketName)
    {
        log.info("Received file delete request for file: " + fileName + " from bucket: " + bucketName);
        return fileService.deleteFile(bucketName, fileName);
    }

    @PostMapping("directory")
    public ResponseEntity<GeneralResponse> createDirectory(
        @RequestParam String directoryName, 
        @RequestParam String parentDirectory,
        @RequestParam String bucketName
    ) {
        log.info("Received directory creation request for directory: " + directoryName + " in bucket: " + bucketName);
        return fileService.createDirectory(directoryName, parentDirectory, bucketName);
    }

    @DeleteMapping("directory")
    public ResponseEntity<GeneralResponse> deleteDirectory(
        @RequestParam String directoryName, 
        @RequestParam String parentDirectory,
        @RequestParam String bucketName
    ) {
        log.info("Received directory creation request for directory: " + directoryName + " in bucket: " + bucketName);
        return fileService.deleteDirectory(directoryName, parentDirectory, bucketName);
    }  
}