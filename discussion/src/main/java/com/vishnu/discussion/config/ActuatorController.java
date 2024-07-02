package com.vishnu.discussion.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ActuatorController {

    @GetMapping("/actuator/health")
    public Health health() {
        // Check if application is healthy and return appropriate status
        return Health.up().build();
    }
}
