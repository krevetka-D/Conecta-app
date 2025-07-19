// frontend/src/services/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/network';
import { setupInterceptors } from './interceptors';

// Create axios instance with optimized config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Development logging
if (__DEV__) {
    apiClient.interceptors.request.use(request => {
        console.log('🚀 API Request:', {
            method: request.method?.toUpperCase(),
            url: request.url,
            baseURL: request.baseURL,
        });
        return request;
    });

    apiClient.interceptors.response.use(
        response => {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
            });
            return response;
        },
        error => {
            console.log('❌ API Error:', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.message,
            });
            return Promise.reject(error);
        }
    );
}

// Token management
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Setup interceptors
setupInterceptors(apiClient);

// Reset API client
export const resetApiClient = () => {
    delete apiClient.defaults.headers.common['Authorization'];
};

// Initialize API client with stored token
export const initializeApiClient = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            setAuthToken(token);
        }
    } catch (error) {
        console.error('Failed to initialize API client with token:', error);
    }
};

export default apiClient;