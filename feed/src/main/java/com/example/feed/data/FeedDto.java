package com.example.feed.data;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedDto {
    private String profileName;
    private PostDto post;
    private int userId;

    public FeedDto(String profileName, PostDto post, int userId) {
        this.profileName = profileName;
        this.post = post;
        this.userId = userId;
    }
}
