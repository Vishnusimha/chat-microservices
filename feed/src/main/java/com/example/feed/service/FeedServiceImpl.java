package com.example.feed.service;

import com.example.feed.data.FeedDto;
import com.example.feed.data.PostDto;
import com.example.feed.data.User;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FeedServiceImpl implements FeedService {
    private static final String FEED_SERVICE = "feedService";

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    public void logCircuitBreakerState() {
        System.out.println("Circuit breaker state: " + circuitBreakerRegistry.circuitBreaker(FEED_SERVICE).getState());
    }

    @Override
    @CircuitBreaker(name = FEED_SERVICE, fallbackMethod = "getFeedFallback")
    public List<FeedDto> getFeed() {
        try {
            log.info("feedService - getFeed");
            List<User> users = webClientBuilder.build().get().uri("http://usersservice/users/all")
                    .retrieve()
//                    .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new RuntimeException("Failed to retrieve users---")))
                    .bodyToMono(new ParameterizedTypeReference<List<User>>() {
                    })
                    .block();

            List<PostDto> posts = webClientBuilder.build().get().uri("http://discussion/api/posts/all")
                    .retrieve()
//                    .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new RuntimeException("Failed to retrieve posts---")))
                    .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                    })
                    .block();

            if (users == null || posts == null) {
                throw new RuntimeException("Failed to retrieve users or posts.");
            }
            Map<Integer, User> userMap = users.stream().collect(Collectors.toMap(User::getUserId, user -> user));

            return posts.stream()
                    .map(post -> {
                        User user = userMap.get(post.getUserId());
                        return new FeedDto(user.getProfileName(), post, user.getUserId());
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Error in getFeed method", e.getCause());
            System.out.println("Error in getFeed method" + e.getCause() + e.getClass());
            throw e; // Rethrow exception to trigger fallback
        }
    }

    // Fallback method for getFeed
    public List<FeedDto> getFeedFallback(Throwable t) {
        log.error("Failed to fetch feed, invoking fallback method", t);
        List<FeedDto> feedDtos = new ArrayList<>();
        PostDto postDto = new PostDto("a", 1, null, 1);
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));

        return feedDtos;
    }

    @Override
    public List<FeedDto> getPostsOfUserByName(String userName) {
        User user = webClientBuilder.build().get().uri("http://usersservice/users/" + userName)
                .retrieve()
                .bodyToMono(User.class)
                .block();

        if (user == null) {
            throw new RuntimeException("User not found: " + userName);
        }
        List<PostDto> posts = webClientBuilder.build().get().uri("http://discussion/api/posts/userId/" + user.getUserId())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                })
                .block();

        if (posts == null) {
            throw new RuntimeException("Posts not found for user: " + userName);
        }
        return posts.stream()
                .map(post -> new FeedDto(user.getProfileName(), post, user.getUserId()))
                .collect(Collectors.toList());
    }
}
