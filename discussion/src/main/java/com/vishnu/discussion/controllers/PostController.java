package com.vishnu.discussion.controllers;

import com.vishnu.discussion.data.CommentDto;
import com.vishnu.discussion.data.PostDto;
import com.vishnu.discussion.exception.CommentNotFoundException;
import com.vishnu.discussion.exception.PostNotFoundException;
import com.vishnu.discussion.service.CommentService;
import com.vishnu.discussion.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @PostMapping("/create")
    public ResponseEntity<PostDto> createPost(@Valid @RequestBody PostDto postDto) {
        if (postDto.getUserId() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        PostDto created = postService.createPost(postDto);
        if (created == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{postId}/update")
    public ResponseEntity<PostDto> updatePost(@PathVariable("postId") Long postId,
            @Valid @RequestBody PostDto postDto) {
        if (postDto.getContent() == null || postDto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        PostDto updated = postService.updatePost(postId, postDto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPostById(@PathVariable("postId") Long postId) {
        PostDto post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    @GetMapping("/userId/{userId}")
    public ResponseEntity<List<PostDto>> getPostByUserId(@PathVariable("userId") Integer userId) {
        List<PostDto> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDto>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPostsWithComments());
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePostById(@PathVariable("postId") Long postId) {
        try {
            postService.deletePostById(postId);
            return ResponseEntity.noContent().build();
        } catch (PostNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<CommentDto> addComment(@PathVariable("postId") Long postId,
            @Valid @RequestBody CommentDto commentDto) {
        try {
            if (commentDto.getContent() == null || commentDto.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            // Check if post exists before adding comment
            PostDto post = postService.getPostById(postId);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }
            CommentDto created = commentService.addCommentToPost(postId, commentDto);
            if (created == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId) {
        try {
            commentService.deleteCommentById(commentId);
            return ResponseEntity.noContent().build();
        } catch (CommentNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<PostDto> likePost(@PathVariable("postId") Long postId) {
        PostDto updated = postService.likePost(postId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}