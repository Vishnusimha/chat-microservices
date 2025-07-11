package com.example.feed.service;

import com.example.feed.data.FeedDto;
import com.example.feed.data.PostDto;
import com.example.feed.data.User;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FeedServiceImpl implements FeedService {
    private static final String FEED_SERVICE = "feedService";

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private HttpServletRequest request;

    public void logCircuitBreakerState() {
        System.out.println("Circuit breaker state: " + circuitBreakerRegistry.circuitBreaker(FEED_SERVICE).getState());
    }

    @Override
    @CircuitBreaker(name = FEED_SERVICE, fallbackMethod = "getFeedFallback")
    public List<FeedDto> getFeed() {
        try {
            log.info("feedService - getFeed");
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

            List<User> users = webClientBuilder.build().get()
                    .uri("http://USERSSERVICE/api/users/all")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    // .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new
                    // RuntimeException("Failed to retrieve users---")))
                    .bodyToMono(new ParameterizedTypeReference<List<User>>() {
                    })
                    .block();

            List<PostDto> posts = webClientBuilder.build().get()
                    .uri("http://DISCUSSION/api/posts/all")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    // .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new
                    // RuntimeException("Failed to retrieve posts---")))
                    .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                    })
                    .block();

            if (users == null || posts == null) {
                log.error("Failed to retrieve users or posts. users={}, posts={}", users, posts);
                throw new RuntimeException("Failed to retrieve users or posts.");
            }
            Map<Integer, User> userMap = users.stream().collect(Collectors.toMap(User::getId, user -> user));

            return posts.stream()
                    .map(post -> {
                        Integer postUserId = post.getUserId();
                        if (postUserId == null) {
                            log.error("Post with null userId: {}", post);
                            return null; // skip this post
                        }
                        User user = userMap.get(postUserId);
                        if (user == null) {
                            log.error("No user found for userId: {} in post {}", postUserId, post);
                            return null; // skip this post
                        }
                        return new FeedDto(user.getProfileName(), post, user.getId());
                    })
                    .filter(Objects::nonNull)
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
        PostDto postDto = new PostDto(1L, "Fallback post content", 0, null, 1);
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));
        feedDtos.add(new FeedDto("Fall Back Sample", postDto, 1));

        return feedDtos;
    }

    @Override
    public List<FeedDto> getPostsOfUserByName(String userName) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        User user = webClientBuilder.build().get()
                .uri("http://USERSSERVICE/api/users/name/" + userName)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .bodyToMono(User.class)
                .block();

        if (user == null) {
            throw new RuntimeException("User not found: " + userName);
        }
        List<PostDto> posts = webClientBuilder.build().get()
                .uri("http://DISCUSSION/api/posts/userId/" + user.getId())
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PostDto>>() {
                })
                .block();

        if (posts == null) {
            throw new RuntimeException("Posts not found for user: " + userName);
        }
        return posts.stream()
                .map(post -> new FeedDto(user.getProfileName(), post, user.getId()))
                .collect(Collectors.toList());
    }
}
