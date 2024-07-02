package com.vishnu.discussion.controllers;

import com.vishnu.discussion.data.CommentDto;
import com.vishnu.discussion.data.PostDto;
import com.vishnu.discussion.exception.CommentNotFoundException;
import com.vishnu.discussion.exception.PostNotFoundException;
import com.vishnu.discussion.service.CommentService;
import com.vishnu.discussion.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired // Dependency injection
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @PostMapping("/create")
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto postDto) {
        return new ResponseEntity<>(postService.createPost(postDto), HttpStatus.CREATED);
    }

    @PutMapping("/{postId}/update")
    public ResponseEntity<PostDto> updatePost(@PathVariable Long postId, @RequestBody PostDto postDto) {
        return ResponseEntity.ok(postService.updatePost(postId, postDto));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
//        return new ResponseEntity<>(postService.getPostById(postId), HttpStatus.OK);
    }

    @GetMapping("userId/{userId}")
    public ResponseEntity<List<PostDto>> getPostByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDto>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPostsWithComments());
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePostById(@PathVariable Long postId) throws PostNotFoundException {
        postService.deletePostById(postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto) {
        return ResponseEntity.ok(commentService.addCommentToPost(postId, commentDto));
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long postId, @PathVariable Long commentId) throws CommentNotFoundException {
        commentService.deleteCommentById(commentId);
        return ResponseEntity.ok().build();
    }
}
