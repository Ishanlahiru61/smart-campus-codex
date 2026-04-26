package com.smartcampus.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFound_Success() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<?> response = handler.handleResourceNotFound(ex);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Not found", ((Map)response.getBody()).get("message"));
    }

    @Test
    void handleGeneralException_Success() {
        Exception ex = new Exception("General error");
        ResponseEntity<?> response = handler.handleGeneralException(ex);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
