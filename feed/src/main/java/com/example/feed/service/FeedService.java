package com.example.feed.service;

import com.example.feed.data.FeedDto;

import java.util.List;

public interface FeedService {
    List<FeedDto> getFeed();
    List<FeedDto> getPostsOfUserByName(String userName);
}
