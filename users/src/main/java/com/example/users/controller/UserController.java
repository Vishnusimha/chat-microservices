package com.example.users.controller;

import com.example.users.data.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("users")
public class UserController {

    @Value("${user.test.string: This is Default Value for user.test.string}")
    private String userTestString;

    @Value("${external.list: four,five,six,four}")
    private List<String> sampleList; // for getting values as a List from external config

    @Value("#{${dbValues}}")
    private Map<String, String> dbValues; // for getting values as a Map from external config

    @GetMapping("/greeting")
    public ResponseEntity<String> getGreeting() {
        return ResponseEntity.ok(userTestString + dbValues);
    }

    @GetMapping("/sampleList")
    public ResponseEntity<List<String>> getSampleList() {
        return ResponseEntity.ok(sampleList);
    }

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
    public ResponseEntity<User> getUserWithUserId(@PathVariable("userId") int userId) {
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
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        System.out.println("USER Details = " + user.getUserName() + user.getUserId() + user.getProfileName());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userName}")
    public ResponseEntity<User> getUserWithUserName(@PathVariable("userName") String userName) {
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
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}
