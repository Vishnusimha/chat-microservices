package com.vishnu.discussion;

import com.vishnu.discussion.service.PostService;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TestConfig {

    @MockBean
    private PostService postService;
}
