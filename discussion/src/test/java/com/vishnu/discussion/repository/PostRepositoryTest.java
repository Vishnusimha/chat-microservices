package com.vishnu.discussion.repository;

import com.vishnu.discussion.data.Comment;
import com.vishnu.discussion.data.Post;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PostRepositoryTest {
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private CommentRepository commentRepository;

    private Comment comment1;
    private Comment comment2;
    private Comment comment3;
    private Comment comment4;
    private Comment comment5;
    private Comment comment6;


    @BeforeEach
    void setUp() {
        Post post1 = new Post("post1", 1);

        Post post2 = new Post("post2", 3);
        Post post3 = new Post("apost3", 4);
        Post post4 = new Post("apost4", 5);

        comment1 = new Comment("comment1");
        comment2 = new Comment("comment2");
        comment3 = new Comment("comment3");

        comment4 = new Comment("comment4");
        comment5 = new Comment("comment5");
        comment6 = new Comment("comment6");

        post1.setComments(List.of(comment1, comment4));
        post2.setComments(List.of(comment2, comment5));
        post3.setComments(List.of(comment3, comment6));

        // Save posts along with associated comments
        postRepository.saveAll(List.of(post1, post2, post3, post4));
    }

    @Test
    void testFindAllWithComments() {
        //Act
        List<Post> posts = postRepository.findAllWithComments();
        List<Comment> comments = commentRepository.findAll();
        // Assert
        assertNotNull(posts);
        assertNotNull(comments);
        assertEquals(4, posts.size());
        assertEquals(6, comments.size());

        assertNotNull(posts.get(0).getComments()); // Ensure comments are not null
    }

    @Test
    void testFindAllWithMoreLikes() {
        List<Post> posts = postRepository.findAllWithMoreLikes();
        assertEquals(3, posts.size());
    }

    @Test
    void testFindByContentStartingWith() {
        List<Post> posts = postRepository.findByContentStartingWith("po");
        assertEquals(2, posts.size());
    }

    @AfterEach
    void tearDown() {
        postRepository.deleteAll();
    }
}