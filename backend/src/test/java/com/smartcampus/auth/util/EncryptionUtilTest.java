package com.smartcampus.auth.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionUtilTest {

    private EncryptionUtil encryptionUtil;

    @BeforeEach
    void setUp() {
        encryptionUtil = new EncryptionUtil();
        ReflectionTestUtils.setField(encryptionUtil, "secretKey", "1234567890123456"); // 16 bytes for AES
    }

    @Test
    void encryptDecrypt_Success() {
        String original = "Hello World";
        String encrypted = encryptionUtil.encrypt(original);
        assertNotNull(encrypted);
        assertNotEquals(original, encrypted);

        String decrypted = encryptionUtil.decrypt(encrypted);
        assertEquals(original, decrypted);
    }
}
