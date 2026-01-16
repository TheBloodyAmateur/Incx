package com.github.thebloodyamateur.incx.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.github.thebloodyamateur.incx.dto.GeneralResponse;
import com.github.thebloodyamateur.incx.dto.LoginRequest;
import com.github.thebloodyamateur.incx.dto.LoginResponse;
import com.github.thebloodyamateur.incx.dto.UserRequest;
import com.github.thebloodyamateur.incx.persistence.model.MinioBucket;
import com.github.thebloodyamateur.incx.persistence.model.User;
import com.github.thebloodyamateur.incx.persistence.repository.MinioBucketsRepository;
import com.github.thebloodyamateur.incx.persistence.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@Service
@Slf4j(topic = "UserServiceLogger")
@AllArgsConstructor
public class AuthService {
    private UserRepository userRepository;
    private MinioBucketsRepository minioBucketsRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private FileService fileService;

    public GeneralResponse login(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            log.warn("User with the username {} not found!", loginRequest.getUsername());
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new GeneralResponse("User " + user.getUsername() + " was logged in succesfully!");
    }

    public GeneralResponse register(LoginRequest userRequest) {
        log.info("Registering new user...", userRequest.getUsername());

        User user = User.builder().username(userRequest.getUsername()).build();
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        
        MinioBucket newBucket = MinioBucket.builder()
                .name(userRequest.getUsername())
                .user(user)
                .build();

        boolean bucketcreatedSuccessfully = fileService.createBucket(newBucket.getName());
        if (!bucketcreatedSuccessfully) {
            throw new RuntimeException("Failed to create bucket for user " + userRequest.getUsername());
        }
        
        userRepository.save(user);
        minioBucketsRepository.save(newBucket);

        return new GeneralResponse("User registered succesfully!");
    }

    public GeneralResponse resetPassword(LoginRequest request) {
        log.info("Resetting password for user {}", request.getUsername());
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isEmpty()) {
             throw new RuntimeException("User not found");
        }
        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return new GeneralResponse("Password reset successfully!");
    }
}
