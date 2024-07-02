package com.vishnu.discussion.config;

import com.vishnu.discussion.data.Comment;
import com.vishnu.discussion.data.Post;
import com.vishnu.discussion.repository.CommentRepository;
import com.vishnu.discussion.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ComponentScan
public class PostConfig {
    @Bean
    CommandLineRunner commandLineRunner(PostRepository postRepository, CommentRepository commentRepository) {
        return args -> {
            Post post1 = new Post("post1", 2, 1);
            Post post2 = new Post("post2", 3, 1);
            Post post3 = new Post("post3", 4, 2);
            Post post4 = new Post("post4", 1, 2);

            Comment comment1 = new Comment("comment1", post1);
            Comment comment2 = new Comment("comment2", post2);
            Comment comment3 = new Comment("comment3", post3);

            Comment comment4 = new Comment("comment4", post1);
            Comment comment5 = new Comment("comment5", post2);
            Comment comment6 = new Comment("comment6", post3);
            System.out.println(post1.getContent() + post1.getUserId());

            postRepository.saveAll(List.of(post1, post2, post3, post4));
            commentRepository.saveAll(List.of(comment1, comment2, comment3, comment4, comment5, comment6));
        };
    }
}
