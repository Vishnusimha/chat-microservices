package com.vishnu.discussion.service;

import com.vishnu.discussion.data.Comment;
import com.vishnu.discussion.data.CommentDto;
import com.vishnu.discussion.data.Post;
import com.vishnu.discussion.exception.CommentAdditionException;
import com.vishnu.discussion.exception.CommentNotFoundException;
import com.vishnu.discussion.exception.PostNotFoundException;
import com.vishnu.discussion.repository.CommentRepository;
import com.vishnu.discussion.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Transactional
    public CommentDto addCommentToPost(Long postId, CommentDto commentDto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        // add more mappings here if needed
        comment.setPost(post);
        try {
            Comment savedComment = commentRepository.save(comment);
            // add more mappings here if needed
            return mapToDto(savedComment);
        } catch (Exception e) {
            throw new CommentAdditionException("Failed to add comment to a post : " + post.getContent(), e);
        }
    }

    @Transactional
    public void deleteCommentById(Long commentId) throws CommentNotFoundException {
        if (commentRepository.findById(commentId).isPresent()) {
            commentRepository.deleteById(commentId);
        } else {
            throw new CommentNotFoundException("No comment present to Delete");
        }
    }

    @Transactional
    private CommentDto createComment(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        // add more mappings here if needed

        return mapToDto(commentRepository.save(comment));
    }

    // Utility method to map Comment entity to CommentDto
    private CommentDto mapToDto(Comment comment) {
        CommentDto commentDto = new CommentDto();
        commentDto.setId(comment.getId());
        commentDto.setContent(comment.getContent());
        // add more mappings here if needed
        return commentDto;
    }
}
