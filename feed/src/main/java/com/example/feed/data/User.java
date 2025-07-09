package com.example.feed.data;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class User {
    private int id; // Changed from userId to id to match JSON response
    private String userName;
    private String profileName;

    public User() {
    }

    public User(int id, String userName, String profileName) {
        this.id = id;
        this.userName = userName;
        this.profileName = profileName;
    }
}
