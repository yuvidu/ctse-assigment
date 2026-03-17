package com.andrew.user_service.controller;

import com.andrew.user_service.model.Usermodel;
import com.andrew.user_service.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Usermodel> register(@RequestBody Usermodel user) {
        return ResponseEntity.ok(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, String>> getUserDetails(@PathVariable String userId) {
        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(Map.of(
                        "name", user.getName(),
                        "email", user.getEmail()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Usermodel> updateUser(@PathVariable String userId, @RequestBody Usermodel user) {
        return ResponseEntity.ok(userService.updateUser(userId, user));
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
