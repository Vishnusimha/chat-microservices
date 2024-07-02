package com.vishnu.discussion.data;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Getter
@Setter
@Table(name = "posts")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = true) // likes can be nullable
    private Integer likes;

    @Column(nullable = true)
    private Integer userId;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments;

    public Post(String content, Integer likes) {
//        TODO check Integer
        this.content = content;
        this.likes = likes;
    }

    public Post(String content, Integer likes, Integer userId) {
        System.out.println("Post Initialising with user ID - " + userId);
        this.content = content;
        this.likes = likes;
        this.userId = userId;
    }
}
