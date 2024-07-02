package com.example.feed.controller;

import com.example.feed.data.FeedDto;
import com.example.feed.data.PostDto;
import com.example.feed.data.User;
import com.netflix.discovery.DiscoveryClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/feed")
public class FeedController {
    @Autowired
    WebClient.Builder webClientBuilder;

    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping("/all")
    public ResponseEntity<List<FeedDto>> getFeed() {
        //PostDto post1 = webClientBuilder.build().get().uri("http://localhost:8082/api/posts/1").retrieve().bodyToMono(PostDto.class).block();
// User user = webClientBuilder.build().get().uri("http://localhost:8081/users/user/1").retrieve().bodyToMono(User.class).block();

//        List<User> users = webClientBuilder.build().get().uri("http://localhost:8081/users/all")
        List<User> users = webClientBuilder.build().get().uri("http://usersservice/users/all")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<User>>() {
                })
                .block();

//        List<PostDto> posts = webClientBuilder.build().get().uri("http://localhost:8082/api/posts/all")
        List<PostDto> posts = webClientBuilder.build().get().uri("http://discussion/api/posts/all")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                })
                .block();

        Map<Integer, User> userMap = users.stream().collect(Collectors.toMap(User::getUserId, user -> user));

        List<FeedDto> feeds = posts.stream()
                .map(post -> {
                    User user = userMap.get(post.getUserId());
                    return new FeedDto(user.getProfileName(), post, user.getUserId());
                })
                .toList();

        return ResponseEntity.ok(feeds);
    }
//TODO  ResponseEntity<List<FeedDto>>  format
    @GetMapping("user/{userName}")
    public ResponseEntity<List<FeedDto>> getPostsOfUserByName(@PathVariable String userName) {
//        User user = webClientBuilder.build().get().uri("http://localhost:8081/users/" + userName).retrieve().bodyToMono(User.class).block();
        User user = webClientBuilder.build().get().uri("http://usersservice/users/" + userName).retrieve().bodyToMono(User.class).block();

        assert user != null;
        System.out.println("USER IS :::::: " + user.getUserName());

//        List<PostDto> posts = webClientBuilder.build().get().uri("http://localhost:8082/api/posts/userId/" + user.getUserId())
        List<PostDto> posts = webClientBuilder.build().get().uri("http://discussion/api/posts/userId/" + user.getUserId())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                })
                .block();

        assert posts != null;
        List<FeedDto> feeds = posts.stream()
                .map(post -> new FeedDto(user.getProfileName(), post, user.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(feeds);
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }
}
