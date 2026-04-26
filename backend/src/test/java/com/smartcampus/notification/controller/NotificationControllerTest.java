package com.smartcampus.notification.controller;

import com.smartcampus.config.TestSecurityConfig;
import com.smartcampus.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import(TestSecurityConfig.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;


    @Test
    @WithMockUser(username = "test@test.com", roles = "USER")
    void getNotifications_Success() throws Exception {
        when(notificationService.getUserNotifications(anyString(), anyString())).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@test.com", roles = "USER")
    void getUnreadCount_Success() throws Exception {
        when(notificationService.getUnreadCount(anyString(), anyString())).thenReturn(5L);
        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk());
    }
}
