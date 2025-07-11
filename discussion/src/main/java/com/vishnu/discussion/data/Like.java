package com.vishnu.discussion.data;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "postId", "userId" })
})
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId", insertable = false, updatable = false)
    private Post post;

    public Like(Long postId, Integer userId) {
        this.postId = postId;
        this.userId = userId;
    }
}
