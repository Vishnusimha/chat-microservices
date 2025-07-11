package com.example.apigateway.controller;

import com.example.apigateway.config.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String USERS_SERVICE_URL = "http://usersservice/api/users";
    @Autowired
    private WebClient.Builder webClientBuilder;

    @PostMapping("/register")
    public Mono<ResponseEntity<String>> register(@RequestBody Map<String, Object> userDto) {
        log.info("Received registration request: {}", userDto);
        return webClientBuilder.build()
                .post()
                .uri(USERS_SERVICE_URL + "/register")
                .bodyValue(userDto)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("Error response from users service: {}", errorBody);
                                    return Mono.error(new RuntimeException(errorBody));
                                }))
                .bodyToMono(String.class)
                .map(response -> {
                    log.info("Successful registration response: {}", response);
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    log.error("Registration error: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(400).body(e.getMessage()));
                });
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<String>> login(@RequestBody Map<String, Object> userDto) {
        return webClientBuilder.build()
                .post()
                .uri(USERS_SERVICE_URL + "/login")
                .bodyValue(userDto)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode node = objectMapper.readTree(response);
                        if (node.has("error")) {
                            return ResponseEntity.status(401).body(node.get("error").asText());
                        }
                        String email = node.get("email").asText();
                        String jwt = jwtUtil.generateTokenFromEmail(email);

                        // Create proper JSON response instead of Map.toString()
                        Map<String, Object> responseMap = Map.of(
                                "token", jwt,
                                "userId", Integer.parseInt(node.get("userId").asText()),
                                "username", node.get("username").asText());

                        String jsonResponse = objectMapper.writeValueAsString(responseMap);
                        return ResponseEntity.ok()
                                .header("Content-Type", "application/json")
                                .body(jsonResponse);
                    } catch (Exception e) {
                        log.error("Error parsing user info: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error processing login");
                    }
                })
                .onErrorResume(e -> {
                    log.error("Exception in login pipeline: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(401).body("Invalid credentials"));
                });
    }
}