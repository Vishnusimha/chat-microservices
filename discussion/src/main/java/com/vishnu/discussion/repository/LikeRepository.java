package com.vishnu.discussion.repository;

import com.vishnu.discussion.data.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByPostIdAndUserId(Long postId, Integer userId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId")
    Integer countByPostId(@Param("postId") Long postId);

    @Query("SELECT l.userId FROM Like l WHERE l.postId = :postId")
    List<Integer> findUserIdsByPostId(@Param("postId") Long postId);

    void deleteByPostIdAndUserId(Long postId, Integer userId);
}
