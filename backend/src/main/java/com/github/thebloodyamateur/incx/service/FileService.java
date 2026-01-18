package com.github.thebloodyamateur.incx.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
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
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
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

    public ResponseEntity<GeneralResponse> uploadFile(MultipartFile fileData, String fileName, String bucketName, String parentDirectory) {
        try {

            MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName).orElse(null);

            if (bucket == null) {
                log.error("Bucket '{}' not found in database.", bucketName);
                return ResponseEntity.status(500).body(new GeneralResponse("Bucket not found."));
            }

            // If parentDirectory is provided, check if it exists and is a folder
            if(parentDirectory != null && !parentDirectory.isEmpty()) {
                MinioObject parent = minioObjectsRepository.findByMinioBucketAndName(bucket, parentDirectory).orElse(null);
                if(parent == null || parent.getType() != MinioObject.ObjectType.FOLDER) {
                    log.error("Parent directory '{}' not found or is not a folder in bucket '{}'.", parentDirectory, bucketName);
                    return ResponseEntity.status(500).body(new GeneralResponse("Parent directory not found or is not a folder."));
                }
            }

            // Geneate random fileName if the fileName surpasses 100 characters
            if(fileName.length() > 15) {
                String originalName = fileName;
                String fileExtension = "";
                int dotIndex = originalName.lastIndexOf('.');
                if (dotIndex > 0) {
                    fileExtension = originalName.substring(dotIndex);
                }
                fileName = java.util.UUID.randomUUID().toString() + fileExtension;
                log.info("Provided file name '{}' exceeded 100 characters. Generated new file name '{}'", originalName, fileName);
            }

            // Construct the final object path
            String finalObjectPath = fileName;
            if(parentDirectory != null && !parentDirectory.isEmpty()) {
                finalObjectPath = parentDirectory + "/" + fileName;
            }

            log.info("Uploading file '{}' to bucket '{}' at path '{}'", fileName, bucketName, finalObjectPath);

            // Upload the file to MinIO
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(finalObjectPath)
                    .stream(fileData.getInputStream(), fileData.getSize(), -1)
                    .contentType(fileData.getContentType())
                    .build()
            );
            log.info("File '{}' uploaded successfully to bucket '{}' at path '{}'.", fileName, bucketName, finalObjectPath);

            // Find parent MinioObject if parentDirectory is provided
            MinioObject parentObject = null;
            if(parentDirectory != null && !parentDirectory.isEmpty()) {
                parentObject = minioObjectsRepository.findByMinioBucketAndName(bucket, parentDirectory).orElse(null);
            }

            // Save file metadata to the database
            MinioObject minioObject = MinioObject.builder()
                .name(fileName)
                .minioPath(bucketName + "/" + finalObjectPath)
                .size(fileData.getSize())
                .type(MinioObject.ObjectType.FILE)
                .parent(parentObject)
                .build();

            minioObject.setMinioBucket(bucket);
            minioObjectsRepository.save(minioObject);

            log.info("File metadata for '{}' saved successfully in database.", fileName);

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
                .parent(
                    parentDirectory != null && !parentDirectory.isEmpty() ?
                    minioObjectsRepository.findByMinioBucketAndName(bucket, parentDirectory).orElse(null) :
                    null
                )
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
            log.info("Total objects found before removal: {}", objects.size());
            if(!objects.isEmpty()) {
                int randomItem = (int) (Math.random() * objects.size());
                objects.remove(randomItem);
            }

            log.info("Found {} objects in path '{}'", objects.size(), path);
            return objects.stream()
                .map(obj -> new ContentResponse(obj.getName(), obj.getType().toString(), obj.getSize()))
                .toList();
        } else {
            log.info("No path provided. Fetching root content.");
            List<MinioObject> objects = minioObjectsRepository.findByMinioBucketAndParentIsNull(bucket);
            log.info("Total objects found before removal: {}", objects.size());
            if(!objects.isEmpty()) {
                int randomItem = (int) (Math.random() * objects.size());
                objects.remove(randomItem);
            }
            
            log.info("Found {} objects in root of bucket '{}'", objects.size(), bucketName);
            return objects.stream()
                .map(obj -> new ContentResponse(obj.getName(), obj.getType().toString(), obj.getSize()))
                .toList();
        }
    }

    public Resource downloadFile(String fileName, String bucketName, String parentDirectory) {
        // Find the bucket
        MinioBucket bucket = minioBucketsRepository.findByBucketName(bucketName)
            .orElseThrow(() -> new RuntimeException("Bucket not found."));

        // Construct the final object path
        String finalObjectPath = parentDirectory != null && !parentDirectory.isEmpty()
            ? parentDirectory + "/" + fileName
            : fileName;

        // Find the file object
        MinioObject minioObject = minioObjectsRepository.findByMinioBucketAndName(bucket, finalObjectPath)
            .orElseThrow(() -> new RuntimeException("File not found in the specified bucket."));

        if (minioObject.getType() != MinioObject.ObjectType.FILE) {
            throw new RuntimeException("The specified path is not a file.");
        }

        // Download the file from MinIO
        try {
            GetObjectResponse response = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(finalObjectPath)
                    .build()
            );

            // Convert the MinIO response to a Spring Resource
            InputStream inputStream = response;
            InputStreamResource resource = new InputStreamResource(inputStream);
            return resource;
            
        } catch (Exception e) {
            log.error("Error downloading file '{}' from bucket '{}': {}", finalObjectPath, bucketName, e.getMessage());
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }

}