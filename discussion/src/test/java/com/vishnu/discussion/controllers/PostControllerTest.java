package com.vishnu.discussion.controllers;

import com.vishnu.discussion.data.CommentDto;
import com.vishnu.discussion.data.PostDto;
import com.vishnu.discussion.service.CommentService;
import com.vishnu.discussion.service.PostService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@WebMvcTest(PostController.class)
class PostControllerTest {
    @MockBean
    private PostService postService;
    @MockBean
    private CommentService commentService;

    @InjectMocks
    private PostController postController;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createPost() throws Exception {
        // Mocking the service method
        PostDto postDto = new PostDto(null, "Test Post", 10, null, 1);
        when(postService.createPost(postDto)).thenReturn(postDto);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.post("/api/posts/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Test Post\",\"likes\":10,\"userId\":1}"))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("Test Post"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.likes").value(10));
    }

    @Test
    public void testGetPostById() throws Exception {
        Long postId = 1L;
        PostDto postDto = new PostDto(postId, "Test Post", 10, null, 1);

        when(postService.getPostById(postId)).thenReturn(postDto);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/posts/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("Test Post"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.likes").value(10));
    }

    @Test
    public void testDeletePostById() throws Exception {
        Long postId = 1L;

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/posts/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    void updatePost() throws Exception {
        // Mocking the service method
        Long postId = 1L;
        PostDto postDto = new PostDto(postId, "Updated Post", 20, null, 1);
        // Mock getPostById to return a post (controller may check existence)
        when(postService.getPostById(postId)).thenReturn(postDto);
        when(postService.updatePost(postId, postDto)).thenReturn(postDto);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.put("/api/posts/{postId}/update", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Updated Post\",\"likes\":20,\"userId\":1}"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("Updated Post"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.likes").value(20));
    }

    @Test
    void getPostById() throws Exception {
        // Mocking the service method
        Long postId = 1L;
        PostDto postDto = new PostDto(postId, "Test Post", 10, null, 1);
        when(postService.getPostById(postId)).thenReturn(postDto);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.get("/api/posts/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("Test Post"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.likes").value(10));
    }

    @Test
    void getAllPosts() throws Exception {
        // Mocking the service method
        List<PostDto> postDtoList = new ArrayList<>();
        postDtoList.add(new PostDto(1L, "Test Post 1", 10, null, 1));
        postDtoList.add(new PostDto(2L, "Test Post 2", 20, null, 1));
        // The controller calls getAllPostsWithComments, not getAllPosts
        when(postService.getAllPostsWithComments()).thenReturn(postDtoList);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.get("/api/posts/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].content").value("Test Post 1"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].likes").value(10))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].content").value("Test Post 2"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].likes").value(20));
    }

    @Test
    void deletePostById() throws Exception {
        // Mocking the service method
        Long postId = 1L;

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/posts/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    void addComment() throws Exception {
        // Mocking the service method
        Long postId = 1L;
        CommentDto commentDto = new CommentDto();
        commentDto.setContent("Test Comment");
        // Mock postService.getPostById to return a post (controller checks existence)
        PostDto postDto = new PostDto(postId, "Test Post", 10, null, 1);
        when(postService.getPostById(postId)).thenReturn(postDto);
        when(commentService.addCommentToPost(postId, commentDto)).thenReturn(commentDto);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.post("/api/posts/{postId}/comment", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Test Comment\"}"))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("Test Comment"));
    }

    @Test
    void deleteComment() throws Exception {
        // Mocking the service method
        Long postId = 1L;
        Long commentId = 1L;

        // Adjust the behavior based on your application logic
        // For example, if deleteCommentById method doesn't return anything, you can
        // mock it using doNothing
        doNothing().when(commentService).deleteCommentById(commentId);

        // Performing the request and verifying the response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/posts/{postId}/comment/{commentId}", postId, commentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @AfterEach
    void tearDown() {

    }
}