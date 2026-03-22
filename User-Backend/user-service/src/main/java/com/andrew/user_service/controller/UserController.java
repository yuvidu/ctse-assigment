package com.andrew.user_service.controller;

import com.andrew.user_service.dto.BookingDTO;
import com.andrew.user_service.dto.LoginRequest;
import com.andrew.user_service.model.Usermodel;
import com.andrew.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/")
    public String hello() {
        return "Hello World";
    }

    @PostMapping("/register")
    public ResponseEntity<Usermodel> register(@RequestBody Usermodel user) {
        return ResponseEntity.ok(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.email(), request.password());
        var user = userService.getUserByEmail(request.email()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, String>> getUserDetails(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return userService.getUserById(userId)
                .map(user -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("name", user.getName() != null ? user.getName() : "");
                    response.put("email", user.getEmail() != null ? user.getEmail() : "");
                    response.put("phone", user.getPhone() != null ? user.getPhone() : "");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/bookings")
    public ResponseEntity<List<BookingDTO>> getBookings(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getBookingsForUser(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Usermodel> updateUser(@PathVariable String userId, @RequestBody Usermodel user) {
        return ResponseEntity.ok(userService.updateUser(userId, user));
    }
}
