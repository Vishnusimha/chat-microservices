package com.example.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                // Authentication routes should go through AuthenticationController
                                .route("users_service_protected", r -> r
                                                .path("/api/users/**")
                                                .and()
                                                .not(p -> p.path("/api/users/register")
                                                                .or()
                                                                .path("/api/users/login"))
                                                .uri("lb://usersservice"))
                                // User service routes via service discovery pattern
                                .route("users_service_discovery", r -> r
                                                .path("/usersservice/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("lb://usersservice"))
                                // Feed service routes
                                .route("feed_service", r -> r
                                                .path("/feed/**")
                                                .uri("lb://feedservice"))
                                // Discussion service routes
                                .route("discussion_service", r -> r
                                                .path("/discussion/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("lb://discussion"))
                                .build();
        }
}
