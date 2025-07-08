package com.example.apigateway.controller;

import com.example.apigateway.config.JwtUtil;
import com.example.apigateway.data.AuthenticationRequest;
import com.example.apigateway.data.UserDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    private final UserDao userDao;
    private final JwtUtil jwtUtil;

    @GetMapping("/authenticatetest")
    public String test() {
        return "API authenticate WORKING";
    }

    @PostMapping("/authenticate")
    public Mono<ResponseEntity<String>> authenticate(@RequestBody AuthenticationRequest request) {
        log.info("AuthenticationController - authenticate");
        return userDao.findUserByEmailReactive(request.getEmail())
                .filter(user -> user.getPassword().equals(request.getPassword()))
                .map(user -> ResponseEntity.ok(jwtUtil.generateToken(user)))
                .switchIfEmpty(Mono.just(ResponseEntity.status(401).body("Invalid credentials")));
    }
}