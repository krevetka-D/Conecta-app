// frontend/src/config/network.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the appropriate API URL based on environment
const getApiUrl = () => {
    // Check if we're in development
    if (__DEV__) {
        // For iOS Simulator
        if (Platform.OS === 'ios') {
            return 'http://localhost:5001/api';
        }
        
        // For Android Emulator
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:5001/api';
        }
        
        // For physical devices, use your machine's IP
        // You'll need to update this with your actual IP
        const debuggerHost = Constants.manifest?.debuggerHost;
        if (debuggerHost) {
            const host = debuggerHost.split(':')[0];
            return `http://${host}:5001/api`;
        }
        
        // Fallback
        return 'http://localhost:5001/api';
    }
    
    // Production URL
    return 'https://api.conectaalicante.com/api';
};

export const API_BASE_URL = getApiUrl();

// WebSocket URL (remove /api suffix)
export const WS_BASE_URL = API_BASE_URL.replace('/api', '').replace('http', 'ws');

// Other network configuration
export const NETWORK_CONFIG = {
    timeout: 30000, // 30 seconds
    retry: {
        attempts: 3,
        delay: 1000,
    },
};

// Export for debugging
if (__DEV__) {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('WS_BASE_URL:', WS_BASE_URL);
}