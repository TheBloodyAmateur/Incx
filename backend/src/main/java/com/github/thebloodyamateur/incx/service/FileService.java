package com.github.thebloodyamateur.incx.service;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.github.thebloodyamateur.incx.dto.ContentResponse;
import com.github.thebloodyamateur.incx.dto.GeneralResponse;
import com.github.thebloodyamateur.incx.persistence.model.MinioBucket;
import com.github.thebloodyamateur.incx.persistence.model.MinioObject;
import com.github.thebloodyamateur.incx.persistence.repository.MinioBucketsRepository;
import com.github.thebloodyamateur.incx.persistence.repository.MinioObjectsRepository;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveBucketArgs;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@AllArgsConstructor
@Service
@Slf4j(topic = "FileServiceLogger")
public class FileService {
    private MinioClient minioClient;
    private MinioBucketsRepository minioBucketsRepository;
    private MinioObjectsRepository minioObjectsRepository;

    public boolean createBucket(String bucketName) {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            log.info("Bucket '{}' exists: {}", bucketName, found);
            if (!found) {
                log.info("Creating bucket '{}'", bucketName);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            return true;
        } catch (Exception e) {
            log.error("Error occurred while creating bucket '{}': {}", bucketName, e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteBucket(String bucketName) {
        log.info("Attempting to delete bucket '{}'", bucketName);
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                log.info("Bucket '{}' does not exist.", bucketName);
                return false;
            }
    
            minioClient.removeBucket(RemoveBucketArgs.builder().bucket(bucketName).build());
            log.info("Bucket '{}' deleted successfully.", bucketName);
            return true;
        } catch (Exception e) {
            log.error("Error deleting bucket '{}': {}", bucketName, e.getMessage());
            return false;
        }
    }

    public boolean deleteBucketById(Long id) {
        MinioBucket bucket = minioBucketsRepository.findById(id).orElse(null);
        log.info("Attempting to delete bucket for ID: {}", id);
        if(bucket == null) {
            log.warn("No bucket found for user ID: {}", id);
            return false;
        }

        RemoveBucketArgs args = RemoveBucketArgs.builder().bucket(bucket.getName()).build();

        try {
            minioClient.removeBucket(args);
            log.info("Bucket '{}' deleted successfully.", bucket.getName());
            return true;
        } catch (Exception e) {
            log.error("Error occurred while deleting bucket '{}': {}", bucket.getName(), e.getMessage());
            e.printStackTrace();
            return false;
        }
        
    }

    public ResponseEntity<GeneralResponse> uploadFile(MultipartFile fileData, String fileName, String bucketName) {
        try {

            MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName).orElse(null);

            if (bucket == null) {
                log.error("Bucket '{}' not found in database.", bucketName);
                return ResponseEntity.status(500).body(new GeneralResponse("Bucket not found."));
            }

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(fileData.getInputStream(), fileData.getSize(), -1)
                    .build()
            );
            log.info("File '{}' uploaded successfully to bucket '{}'.", fileName, bucketName);

            MinioObject minioObject = MinioObject.builder()
                .name(fileName)
                .minioPath(bucketName + "/" + fileName)
                .size(fileData.getSize())
                .type(MinioObject.ObjectType.FILE)
                .build();
            
            minioObject.setMinioBucket(bucket);
            minioObjectsRepository.save(minioObject);

            return ResponseEntity.ok(new GeneralResponse("File uploaded successfully."));
        } catch (Exception e) {
            log.error("Error uploading file to bucket '{}': {}", bucketName, e.getMessage());
            return ResponseEntity.status(500).body(new GeneralResponse("Failed to upload file."));
        }
    }

    public ResponseEntity<GeneralResponse> deleteFile(String bucketName, String fileName) {
        MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName).orElse(null);
        if (bucket == null) {
            log.error("Bucket '{}' not found in database.", bucketName);
            return ResponseEntity.status(500).body(new GeneralResponse("Bucket not found."));
        }

        MinioObject minioObject = minioObjectsRepository.findByMinioBucketAndName(bucket, fileName).orElse(null);
        if (minioObject == null) {
            log.error("File '{}' not found in bucket '{}'.", fileName, bucketName);
            return ResponseEntity.status(500).body(new GeneralResponse("File not found in the specified bucket."));
        }

        try {
            minioClient.removeObject(
                io.minio.RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .build()
            );
            log.info("File '{}' deleted successfully from bucket '{}'.", fileName, bucketName);

            minioObjectsRepository.delete(minioObject);

            return ResponseEntity.ok(new GeneralResponse("File deleted successfully."));
        } catch (Exception e) {
            log.error("Error deleting file '{}' from bucket '{}': {}", fileName, bucketName, e.getMessage());
            return ResponseEntity.status(500).body(new GeneralResponse("Failed to delete file."));
        }
    }

    public ResponseEntity<GeneralResponse> createDirectory(
        String directoryName, 
        String parentDirectory,
        String bucketName
    ) {
        try {
            // Check if bucket exists
            MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName).orElse(null);
            if (bucket == null) {
                log.error("Bucket '{}' not found in database.", bucketName);
                return ResponseEntity.status(422).body(new GeneralResponse("Bucket not found."));
            }

            log.info("Creating directory '{}' in bucket '{}'", directoryName, bucketName);

            // If parentDirectory is provided, check if it exists and is a folder
            if(parentDirectory != null && !parentDirectory.isEmpty()) {
                MinioObject parent = minioObjectsRepository.findByMinioBucketAndName(bucket, parentDirectory).orElse(null);
                if(parent == null || parent.getType() != MinioObject.ObjectType.FOLDER) {
                    log.error("Parent directory '{}' not found or is not a folder in bucket '{}'.", parentDirectory, bucketName);
                    return ResponseEntity.status(422).body(new GeneralResponse("Parent directory not found or is not a folder."));
                }
            }

            log.debug("Parent directory check passed for '{}'", parentDirectory);
            
            // Create the directory path
            String finalDirectoryPath = "";
            if(parentDirectory != null && !parentDirectory.isEmpty()) {
                finalDirectoryPath = parentDirectory + "/" + directoryName + "/";
            } else {
                finalDirectoryPath = directoryName + "/";
            }

            log.debug("Final directory path to create: '{}'", finalDirectoryPath);

            // Create a zero-byte object to represent the directory
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(finalDirectoryPath)
                    .stream(new ByteArrayInputStream(new byte[0]), 0, -1)
                    .build()
            );
            log.debug("Directory '{}' created successfully in bucket '{}'.", finalDirectoryPath, bucketName);

            MinioObject minioObject = MinioObject.builder()
                .name(directoryName)
                .minioPath(bucketName + "/" + finalDirectoryPath)
                .size(0L)
                .type(MinioObject.ObjectType.FOLDER)
                .build();

            minioObject.setMinioBucket(bucket);
            minioObjectsRepository.save(minioObject);
            return ResponseEntity.ok(new GeneralResponse("Directory created successfully."));
        } catch (Exception e) {
            log.error("Error creating directory '{}' in bucket '{}': {}", directoryName, bucketName, e.getMessage());
            return ResponseEntity.status(404).body(new GeneralResponse("Failed to create directory."));
        }
        
    }

    public ResponseEntity<GeneralResponse> deleteDirectory(String directoryName, String parentDirectory, String bucketName) {
        try {
        
            // Check if bucket exists
            MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName).orElse(null);
            if (bucket == null) {
                log.error("Bucket '{}' not found in database.", bucketName);
                return ResponseEntity.status(422).body(new GeneralResponse("Bucket not found."));
            }

            log.info("Found bucket '{}'. Proceeding to delete directory '{}'", bucketName, directoryName);

            // Get the minio object for the directory
            MinioObject directoryObject = minioObjectsRepository.findByMinioBucketAndName(bucket, directoryName).orElse(null);
            if (directoryObject == null || directoryObject.getType() != MinioObject.ObjectType.FOLDER) {
                log.error("Directory '{}' not found or is not a folder in bucket '{}'.", directoryName, bucketName);
                return ResponseEntity.status(422).body(new GeneralResponse("Directory not found or is not a folder."));
            }

            log.info("Found directory object for '{}'. Checking if it is empty.", directoryName);

            // Check if the directory is empty
           boolean isNotEmpty = minioObjectsRepository.folderExistsAndIsNotEmpty(bucket, directoryName);
           if (isNotEmpty) {
                log.warn("Directory '{}' is not empty. Cannot delete non-empty directories.", directoryName);
                return ResponseEntity.status(422).body(new GeneralResponse("Directory is not empty."));
           }

            log.info("Directory '{}' is empty. Proceeding to delete.", directoryName);

            // Delete the directory object from MinIO
            minioClient.removeObject(
                io.minio.RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(directoryObject.getMinioPath().substring(bucketName.length() + 1))
                    .build()
            );
            log.info("Directory '{}' deleted successfully from bucket '{}'.", directoryName, bucketName);

            // Delete the directory object from the database
            minioObjectsRepository.delete(directoryObject);

            return ResponseEntity.ok(new GeneralResponse("Directory "  + directoryName + " deleted successfully."));
        } catch (Exception e) {
            log.error("Error deleting directory '{}' in bucket '{}': {}", directoryName, bucketName, e.getMessage());
            return ResponseEntity.status(404).body(new GeneralResponse("Failed to delete directory."));
        }
    }

    public List<ContentResponse> getContent(String bucketName, String path) {
        log.info("Fetching content for bucket '{}' and path '{}'", bucketName, path);

        MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName)
            .orElseThrow(() -> new RuntimeException("Bucket not found"));

        if (path != null && !path.isEmpty()) {
            log.info("Fetching content for path '{}'", path);
            List<MinioObject> objects = minioObjectsRepository.findByMinioBucketAndParent_Name(bucket, path);
            log.info("Found {} objects in path '{}'", objects.size(), path);
            return objects.stream()
                .map(obj -> new ContentResponse(obj.getName(), obj.getType().toString(), obj.getSize()))
                .toList();
        } else {
            log.info("No path provided. Fetching root content.");
            List<MinioObject> objects = minioObjectsRepository.findByMinioBucketAndParentIsNull(bucket);
            log.info("Found {} objects in root of bucket '{}'", objects.size(), bucketName);
            return objects.stream()
                .map(obj -> new ContentResponse(obj.getName(), obj.getType().toString(), obj.getSize()))
                .toList();
        }
    }

}