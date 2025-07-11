package com.vishnu.discussion.data;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LikeResponse {
    private int likes;
    private String message;
}
