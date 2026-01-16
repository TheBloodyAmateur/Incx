package com.github.thebloodyamateur.incx.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.thebloodyamateur.incx.dto.GeneralResponse;
import com.github.thebloodyamateur.incx.dto.LoginRequest;
import com.github.thebloodyamateur.incx.service.AuthService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("auth")
@Slf4j(topic = "AuthControllerLogger")
@AllArgsConstructor
public class AuthController {
    private AuthService userService;

    @PostMapping("/login")
    public GeneralResponse login(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest);
    }

    @PostMapping("/register")
    public GeneralResponse register(@RequestBody LoginRequest user) {
        log.info("Received request!");
        return userService.register(user);
    }

    @PostMapping("/reset")
    public GeneralResponse reset(@RequestBody LoginRequest user) {
        return userService.resetPassword(user);
    }
}