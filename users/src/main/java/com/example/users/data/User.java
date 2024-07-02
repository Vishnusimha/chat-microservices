package com.example.users.data;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class User {
    private int userId;
    private String userName;
    private String profileName;

    public User(int userId, String userName, String profileName) {
        this.userId = userId;
        this.userName = userName;
        this.profileName = profileName;
    }
}
