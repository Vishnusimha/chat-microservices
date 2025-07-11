package com.example.feed.controller;

import com.example.feed.data.FeedDto;
import com.example.feed.service.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@RestController
@RequestMapping("/feed")
public class FeedController {
    @Autowired
    WebClient.Builder webClientBuilder;

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private FeedService feedService;

    @GetMapping("/all")
    public ResponseEntity<List<FeedDto>> getFeed() {
        return ResponseEntity.ok(feedService.getFeed());
    }

    @GetMapping("/user/{userName}")
    public ResponseEntity<List<FeedDto>> getPostsOfUserByName(@PathVariable("userName") String userName) {
        return ResponseEntity.ok(feedService.getPostsOfUserByName(userName));
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }
}
