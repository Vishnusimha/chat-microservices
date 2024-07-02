package com.vishnu.discussion.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@ControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(value = {ApiRequestException.class})
    public ResponseEntity<Object> handleApiRequestException(ApiRequestException e) {
        System.out.println("ApiExceptionHandler : handleApiRequestException");
        ApiException badRequest = new ApiException(e.getMessage(), HttpStatus.BAD_REQUEST, ZonedDateTime.now(ZoneId.of("Z")));
        return new ResponseEntity<>(badRequest, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = {CommentNotFoundException.class})
    public ResponseEntity<Object> handleCommentNotFoundException(CommentNotFoundException e) {
        System.out.println("ApiExceptionHandler : handleCommentNotFoundException");
        ApiException notFound = new ApiException(e.getMessage(), HttpStatus.NOT_FOUND, ZonedDateTime.now(ZoneId.of("Z")));
        return new ResponseEntity<>(notFound, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = {PostNotFoundException.class})
    public ResponseEntity<Object> handlePostNotFoundException(PostNotFoundException e) {
        System.out.println("ApiExceptionHandler : handlePostNotFoundException");
        ApiException notFound = new ApiException(e.getMessage(), HttpStatus.NOT_FOUND, ZonedDateTime.now(ZoneId.of("Z")));
        return new ResponseEntity<>(notFound, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PostCreationException.class)
    public ResponseEntity<Object> handlePostCreationException(PostCreationException e) {
        System.out.println("ApiExceptionHandler : handlePostCreationException");
        ApiException postCreationException = new ApiException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ZonedDateTime.now(ZoneId.of("Z")));
        return new ResponseEntity<>(postCreationException, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(CommentAdditionException.class)
    public ResponseEntity<Object> handleCommentAdditionException(CommentAdditionException e) {
        System.out.println("ApiExceptionHandler : handleCommentAdditionException");
        ApiException commentAdditionException = new ApiException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ZonedDateTime.now(ZoneId.of("Z")));
        return new ResponseEntity<>(commentAdditionException, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
