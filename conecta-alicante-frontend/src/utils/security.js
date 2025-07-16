// src/utils/security.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Simple encryption for demo - in production use proper encryption library
const encrypt = async (text) => {
    try {
        // In production, use a proper encryption library like react-native-crypto
        const encoded = btoa(encodeURIComponent(text));
        return encoded;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

const decrypt = async (encryptedText) => {
    try {
        // In production, use a proper decryption library
        const decoded = decodeURIComponent(atob(encryptedText));
        return decoded;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText;
    }
};

export const secureStorage = {
    setItem: async (key, value) => {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            const encrypted = await encrypt(stringValue);
            await AsyncStorage.setItem(`@secure_${key}`, encrypted);
        } catch (error) {
            console.error('Secure storage set error:', error);
            throw error;
        }
    },

    getItem: async (key) => {
        try {
            const encrypted = await AsyncStorage.getItem(`@secure_${key}`);
            if (!encrypted) return null;

            const decrypted = await decrypt(encrypted);

            try {
                return JSON.parse(decrypted);
            } catch {
                return decrypted;
            }
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    },

    removeItem: async (key) => {
        try {
            await AsyncStorage.removeItem(`@secure_${key}`);
        } catch (error) {
            console.error('Secure storage remove error:', error);
            throw error;
        }
    },

    clear: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const secureKeys = keys.filter(key => key.startsWith('@secure_'));
            await AsyncStorage.multiRemove(secureKeys);
        } catch (error) {
            console.error('Secure storage clear error:', error);
            throw error;
        }
    },
};

// Generate random string for session tokens
export const generateSecureToken = async (length = 32) => {
    try {
        const randomBytes = await Crypto.getRandomBytesAsync(length);
        return btoa(String.fromCharCode.apply(null, new Uint8Array(randomBytes)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (error) {
        // Fallback to Math.random (less secure)
        return Array.from({ length }, () =>
            Math.random().toString(36).charAt(2)
        ).join('');
    }
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
};

// Validate URL to prevent malicious redirects
export const isValidUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
};

// Hash sensitive data
export const hashData = async (data) => {
    try {
        const digest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            data
        );
        return digest;
    } catch (error) {
        console.error('Hashing error:', error);
        return null;
    }
};