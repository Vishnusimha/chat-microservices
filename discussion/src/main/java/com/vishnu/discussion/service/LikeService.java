package com.vishnu.discussion.service;

import com.vishnu.discussion.data.Like;
import com.vishnu.discussion.data.Post;
import com.vishnu.discussion.repository.LikeRepository;
import com.vishnu.discussion.repository.PostRepository;
import com.vishnu.discussion.exception.PostNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Transactional
    public boolean isPostLikedByUser(Long postId, Integer userId) {
        return likeRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    @Transactional
    public int getLikeCount(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    @Transactional
    public int addLike(Long postId, Integer userId) {
        log.info("Adding like for post {} by user {}", postId, userId);

        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        // Check if user already liked this post
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            log.info("User {} already liked post {}", userId, postId);
            return getLikeCount(postId);
        }

        // Create new like
        Like like = new Like(postId, userId);
        likeRepository.save(like);

        // Update like count in post
        int newLikeCount = getLikeCount(postId);
        post.setLikes(newLikeCount);
        postRepository.save(post);

        log.info("Like added successfully. New count: {}", newLikeCount);
        return newLikeCount;
    }

    @Transactional
    public int removeLike(Long postId, Integer userId) {
        log.info("Removing like for post {} by user {}", postId, userId);

        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        // Check if user has liked this post
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isEmpty()) {
            log.info("User {} has not liked post {}", userId, postId);
            return getLikeCount(postId);
        }

        // Remove like
        likeRepository.deleteByPostIdAndUserId(postId, userId);

        // Update like count in post
        int newLikeCount = getLikeCount(postId);
        post.setLikes(newLikeCount);
        postRepository.save(post);

        log.info("Like removed successfully. New count: {}", newLikeCount);
        return newLikeCount;
    }
}
