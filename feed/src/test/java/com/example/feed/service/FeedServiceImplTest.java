package com.example.feed.service;

import com.example.feed.data.FeedDto;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class FeedServiceImplTest {

    @Autowired
    private FeedService feedService;

    @MockBean
    private WebClient.Builder webClientBuilder;

    @Test
    public void testGetFeedCircuitBreaker() {
        // Mock WebClient to simulate post service failure
        WebClient mockWebClient = Mockito.mock(WebClient.class);
        WebClient.RequestHeadersUriSpec requestHeadersUriSpec = Mockito.mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = Mockito.mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = Mockito.mock(WebClient.ResponseSpec.class);

        Mockito.when(webClientBuilder.build()).thenReturn(mockWebClient);
        Mockito.when(mockWebClient.get()).thenReturn(requestHeadersUriSpec);
        Mockito.when(requestHeadersUriSpec.uri(Mockito.anyString())).thenReturn(requestHeadersSpec);
        Mockito.when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        Mockito.when(responseSpec.bodyToMono(Mockito.any(ParameterizedTypeReference.class)))
                .thenReturn(Mono.error(new RuntimeException("Simulated service failure")));

        // Call the service method
        List<FeedDto> result = feedService.getFeed();

        // Verify that fallback method was invoked
        assertTrue(result.isEmpty());
    }
}


