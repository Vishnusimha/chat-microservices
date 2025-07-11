package com.example.users.controller;

import com.example.users.dto.LoginRequest;
import com.example.users.dto.RegisterRequest;
import com.example.users.model.User;
import com.example.users.repository.UserRepository;
import com.example.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Value("${user.test.string:This is Default Value for user.test.string}")
    private String userTestString;

    @Value("${external.list:four,five,six,four}")
    private List<String> sampleList;

    @Value("#{${dbValues:{'key': 'value'}}}")
    private Map<String, String> dbValues;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "userId", registeredUser.getId(),
                    "email", registeredUser.getEmail(),
                    "userName", registeredUser.getUserName()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred during registration: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", user.getId(),
                    "username", user.getUserName(),
                    "email", user.getEmail()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{userName}")
    public ResponseEntity<?> getUserByUserName(@PathVariable("userName") String userName) {
        return userRepository.findByUserName(userName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/greeting")
    public ResponseEntity<Map<String, Object>> getGreeting() {
        return ResponseEntity.ok(Map.of(
                "greeting", userTestString,
                "dbValues", dbValues));
    }

    @GetMapping("/config/list")
    public ResponseEntity<List<String>> getConfigList() {
        return ResponseEntity.ok(sampleList);
    }
}
