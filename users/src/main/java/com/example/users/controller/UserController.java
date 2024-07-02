package com.example.users.controller;

import com.example.users.data.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("users")
public class UserController {

    @GetMapping("/all")
    public List<User> getUsers() {
        System.out.println("GET ALL USERS ");

        return List.of(
                new User(1, "vishnu", "vish"),
                new User(2, "simha", "simba"),
                new User(3, "sunith", "Sagar"),
                new User(10, "Sample", "SampleVName")
        );
    }

    @GetMapping("user/{userId}")
    public ResponseEntity<User> getUserWithUserId(@PathVariable int userId) {
        System.out.println("GET USER WITH USER ID = " + userId);
        List<User> userList = List.of(
                new User(1, "vishnu", "vish"),
                new User(2, "simha", "simba"),
                new User(3, "sunith", "Sagar"),
                new User(10, "Sample", "SampleVName")
        );

        User user = userList.stream()
                .filter(usr -> usr.getUserId() == userId)
                .findAny()
                .orElse(new User(10, "Sample", "SampleVName"));
        System.out.println("USER Details = " + user.getUserName() + user.getUserId() +user.getProfileName());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userName}")
    public ResponseEntity<User> getUserWithUserName(@PathVariable String userName) {
        System.out.println("GET USER WITH USER userName = " + userName);
        List<User> userList = List.of(
                new User(1, "vishnu", "vish"),
                new User(2, "simha", "simba"),
                new User(3, "sunith", "Sagar"),
                new User(10, "Sample", "SampleVName")
        );
        User user = userList.stream()
                .filter(user1 -> user1.getUserName().equals(userName))
                .findAny()
                .orElse(new User(10, "Sample", "SampleVName"));

        return ResponseEntity.ok(user);
    }
}
