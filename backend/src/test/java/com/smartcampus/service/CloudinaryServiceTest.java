package com.smartcampus.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    @Test
    void uploadFile_Success() throws IOException {
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("secure_url", "http://res.cloudinary.com/test.jpg"));

        String result = cloudinaryService.uploadFile(file);

        assertEquals("http://res.cloudinary.com/test.jpg", result);
    }

    @Test
    void uploadFile_InvalidType_ThrowsException() {
        when(file.getContentType()).thenReturn("application/pdf");
        assertThrows(IllegalArgumentException.class, () -> cloudinaryService.uploadFile(file));
    }
}
