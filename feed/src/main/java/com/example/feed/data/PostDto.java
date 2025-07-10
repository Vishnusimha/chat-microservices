package com.example.feed.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostDto {
    private Long id;
    private String content;
    private Integer likes;
    private List<CommentDto> comments;
    private Integer userId;
}
