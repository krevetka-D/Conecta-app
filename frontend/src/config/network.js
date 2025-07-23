//automatically detect mac ip

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { devLog, devError } from '../utils';

// IP address - UPDATE THIS if your IP changes
const LOCAL_IP = '192.168.1.129';

// Get the appropriate API URL based on environment
const getApiUrl = () => {
    // Check if we're in development
    if (__DEV__) {
        // For iOS Simulator
        if (Platform.OS === 'ios' && !Device.isDevice) {
            return 'http://localhost:5001/api';
        }

        // For Android Emulator
        if (Platform.OS === 'android' && !Device.isDevice) {
            return 'http://10.0.2.2:5001/api';
        }

        // For physical devices (both iOS and Android)
        if (Device.isDevice) {
            // Try to get IP from Expo manifest first
            const manifestUri =
                Constants.expoConfig?.hostUri ||
                Constants.manifest?.hostUri ||
                Constants.manifest?.debuggerHost ||
                Constants.manifest2?.extra?.expoGo?.debuggerHost;
            if (manifestUri) {
                const host = manifestUri.split(':')[0];
                if (host && host !== '') {
                    devLog('Network', 'Using auto-detected IP', host);
                    return `http://${host}:5001/api`;
                }
            }

            // Fallback to hardcoded IP
            devLog('Network', 'Using hardcoded IP', LOCAL_IP);
            return `http://${LOCAL_IP}:5001/api`;
        }

        // Default fallback
        return `http://${LOCAL_IP}:5001/api`;
    }

    // Production URL (update this with your actual production URL)
    return 'https://api.conectaalicante.com/api';
};

// Get WebSocket URL
const getWsUrl = () => {
    const apiUrl = getApiUrl();
    return apiUrl.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
};

export const API_BASE_URL = getApiUrl();
export const WS_BASE_URL = getWsUrl();

// Network configuration
export const NETWORK_CONFIG = {
    timeout: 30000, // 30 seconds
    retry: {
        attempts: 3,
        delay: 1000,
        backoff: 2,
    },
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
};

// Helper function to check if we can reach the backend
export const checkBackendConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000,
        });
        return response.ok;
    } catch (error) {
        devError('Network', 'Backend connection check failed', error);
        return false;
    }
};

// Export for debugging
if (__DEV__) {
    devLog('Network', '=== Network Configuration ===', {
        Platform: Platform.OS,
        'Is Physical Device': Device.isDevice,
        'Device Name': Device.deviceName,
        API_BASE_URL: API_BASE_URL,
        WS_BASE_URL: WS_BASE_URL,
        'Local IP': LOCAL_IP,
    });
}

// Helper to update IP dynamically (useful for development)
export const updateLocalIP = (newIP) => {
    if (__DEV__) {
        devLog('Network', `Updating local IP from ${LOCAL_IP} to ${newIP}`);
        // Note: This won't actually update the const, you'd need to refactor
        // to use a variable or state management for dynamic IP updates
    }
};

export default {
    API_BASE_URL,
    WS_BASE_URL,
    NETWORK_CONFIG,
    checkBackendConnection,
};
