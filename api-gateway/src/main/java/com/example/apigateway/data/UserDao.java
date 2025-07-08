package com.example.apigateway.data;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Repository
@Slf4j
public class UserDao {
    private static final String ADMIN = "ADMIN";
    private static final String USER = "USER";

    private final static List<UserDetails> APPLICATION_USERS = Arrays.asList(
            new User("yournewemail@example.com",
                    "yournewpassword",
                    Collections.singleton(new SimpleGrantedAuthority(ADMIN))),
            new User("anotheruser@example.com",
                    "anotherpassword",
                    Collections.singleton(new SimpleGrantedAuthority(USER))));

    public UserDetails findUserByEmail(String email) {
        log.info("findUserByEmail - " + email);
        return APPLICATION_USERS.stream()
                .filter(user -> user.getUsername().equals(email))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("No UserDao was found"));
    }

    public Mono<UserDetails> findUserByEmailReactive(String email) {
        try {
            return Mono.just(findUserByEmail(email));
        } catch (UsernameNotFoundException e) {
            return Mono.empty();
        }
    }
}
