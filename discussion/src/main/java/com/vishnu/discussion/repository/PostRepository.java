package com.vishnu.discussion.repository;

import com.vishnu.discussion.data.Post;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.comments")
    List<Post> findAllWithComments();

    List<Post> findAllByUserId(Long userId);

    @Query("SELECT p FROM Post p WHERE p.likes > 2")
    List<Post> findAllWithMoreLikes();

    List<Post> findByContentStartingWith(String prefix);
}
