package com.example.feed.controller;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @CircuitBreaker(name = "feedService", fallbackMethod = "fallback")
    @GetMapping("/test")
    public String test(@RequestParam boolean fail) {
        if (fail) {
            throw new RuntimeException("Simulated failure");
        }
        return "Success";
    }

    public String fallback(boolean fail, Throwable t) {
        return "Fallback";
    }
}
