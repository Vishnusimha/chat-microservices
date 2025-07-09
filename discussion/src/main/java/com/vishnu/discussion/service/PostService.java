package com.vishnu.discussion.service;

import com.vishnu.discussion.data.Comment;
import com.vishnu.discussion.data.CommentDto;
import com.vishnu.discussion.data.Post;
import com.vishnu.discussion.data.PostDto;
import com.vishnu.discussion.exception.PostCreationException;
import com.vishnu.discussion.exception.PostNotFoundException;
import com.vishnu.discussion.repository.CommentRepository;
import com.vishnu.discussion.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Transactional
    public PostDto createPost(PostDto postDto) {
        log.info("postService - createPost");
        Post post = new Post();
        post.setContent(postDto.getContent());
        if (postDto.getLikes() != null) {
            post.setLikes(postDto.getLikes());
        }
        if (postDto.getUserId() != null) {
            post.setUserId(postDto.getUserId());
        }
        try {
            Post savedPost = postRepository.save(post);
            // add more mappings here if needed
            return mapToDto(savedPost);
        } catch (Exception e) {
            throw new PostCreationException("Failed to create post Exception", e);
        }
    }

    @Transactional
    public PostDto updatePost(Long postId, PostDto postDto) {
        log.info("postService - updatePost");
        Post post = postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("Post not found"));
        post.setContent(postDto.getContent());
        if (postDto.getLikes() != null) {
            post.setLikes(postDto.getLikes());
        }
        // Optionally allow updating userId
        if (postDto.getUserId() != null) {
            post.setUserId(postDto.getUserId());
        }
        try {
            Post savedPost = postRepository.save(post);
            // add more mappings here if needed
            return mapToDto(savedPost);
        } catch (Exception e) {
            throw new PostCreationException("Failed to update post", e);
        }
    }

    @Transactional
    public PostDto getPostById(Long postId) {
        log.info("postService - getPostById");
        Post post = postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("Post not found"));
        return mapToDto(post);
    }

    @Transactional
    public List<PostDto> getPostsByUserId(Long userId) {
        log.info("postService - getPostsByUserId");
        List<Post> postsFromRepo = postRepository.findAllByUserId(userId).stream().toList();
        List<PostDto> posts = postsFromRepo.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        // TODO
        posts.forEach(System.out::println);
        return posts;
    }

    @Transactional
    public List<PostDto> getAllPosts() {
        log.info("postService - getAllPosts");
        return postRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PostDto> getAllPostsWithComments() {
        log.info("postService - getAllPostsWithComments");
        System.out.println(
                "findAllWithMoreLikes()" + postRepository.findAllWithMoreLikes().stream().map(this::mapToDto).toList());
        System.out.println("findByContentStartingWith()"
                + postRepository.findByContentStartingWith("po").stream().map(this::mapToDto).toList());
        List<Post> posts = postRepository.findAllWithComments();
        try {
            return posts.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (PostNotFoundException e) {
            throw new PostNotFoundException("Posts and comments not found");
        }
    }

    @Transactional
    public void deletePostById(Long postId) throws PostNotFoundException {
        log.info("postService - deletePostById");
        if (postRepository.findById(postId).isPresent()) {
            postRepository.deleteById(postId);
        } else {
            throw new PostNotFoundException("Post not found to Delete");
        }
    }

    @Transactional
    public PostDto likePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (post.getLikes() == null) {
            post.setLikes(1);
        } else {
            post.setLikes(post.getLikes() + 1);
        }
        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    // Utility method to map Post entity to PostDto
    private PostDto mapToDto(Post post) {
        PostDto postDto = new PostDto();
        postDto.setId(post.getId());
        postDto.setContent(post.getContent());
        postDto.setLikes(post.getLikes());
        postDto.setComments(mapCommentsToDto(post.getComments()));
        postDto.setUserId(post.getUserId());
        // add more mappings here if needed
        return postDto;
    }

    private List<CommentDto> mapCommentsToDto(List<Comment> comments) {
        return Optional.ofNullable(comments)
                .map(list -> list.stream()
                        .map(comment -> {
                            CommentDto commentDto = new CommentDto();
                            commentDto.setId(comment.getId());
                            commentDto.setContent(comment.getContent());
                            return commentDto;
                        }).collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }
}
