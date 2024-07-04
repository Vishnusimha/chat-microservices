package com.example.feed.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HealthIndicatorConfig {

    @Bean
    public HealthIndicator feedServiceHealthIndicator(CircuitBreakerRegistry circuitBreakerRegistry) {
        CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("feedService");
        return () -> {
            CircuitBreaker.State state = circuitBreaker.getState();
            return Health.up().withDetail("state", state).build();
        };
    }

    @Bean
    public HealthIndicator compositeHealthIndicator(CircuitBreakerRegistry circuitBreakerRegistry) {
        return feedServiceHealthIndicator(circuitBreakerRegistry);
    }
}
