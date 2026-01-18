package com.github.thebloodyamateur.incx.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.github.thebloodyamateur.incx.dto.ContentResponse;
import com.github.thebloodyamateur.incx.dto.GeneralResponse;
import com.github.thebloodyamateur.incx.service.FileService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("files")
@Slf4j(topic = "FileController")
@AllArgsConstructor
public class FileController {
    private FileService fileService;

    @PostMapping(value = "upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeneralResponse> createFile(
        @RequestParam MultipartFile fileData,
        @RequestParam String fileName,
        @RequestParam String bucketName,
        @RequestParam(required = false) String parentDirectory
    ) {
        log.info("Received file upload request for file: " + fileName + " to bucket: " + bucketName + " in directory: " + parentDirectory);
        return fileService.uploadFile(fileData, fileName, bucketName, parentDirectory);
    }

    @DeleteMapping("delete")
    public ResponseEntity<GeneralResponse> deleteFile(
        @RequestParam String fileName,
        @RequestParam String bucketName)
    {
        log.info("Received file delete request for file: " + fileName + " from bucket: " + bucketName);
        return fileService.deleteFile(bucketName, fileName);
    }

    @GetMapping(value = "/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Resource> downloadFile(
        @RequestParam String fileName,
        @RequestParam String bucketName,
        @RequestParam(required = false, defaultValue = "") String parentDirectory
    ) {
        log.info("Received file download request for file: {} from bucket: {} in directory: {}", fileName, bucketName, parentDirectory);
        Resource fileResource = fileService.downloadFile(fileName, bucketName, parentDirectory);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }
    
    @PostMapping("directory")
    public ResponseEntity<GeneralResponse> createDirectory(
        @RequestParam String directoryName, 
        @RequestParam String parentDirectory,
        @RequestParam String bucketName
    ) {
        log.info("Received directory creation request for directory: " + directoryName + " in bucket: " + bucketName + " under parent directory: " + parentDirectory);
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

    @GetMapping(value = "/content", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ContentResponse> getContent(
        @RequestParam String bucketName,
        @RequestParam(required = false) String path
    ) {
        List<ContentResponse> contents = fileService.getContent(bucketName, path);
        log.info("Fetched contents for bucket: " + bucketName + " at path: " + path);
        return contents;
    }
}