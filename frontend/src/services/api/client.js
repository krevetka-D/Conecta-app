// frontend/src/services/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';
import { setupInterceptors } from './interceptors';

// Create axios instance with better defaults
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Track request/response for debugging
if (__DEV__) {
    // Request logger
    apiClient.interceptors.request.use(request => {
        console.log('🚀 API Request:', {
            method: request.method?.toUpperCase(),
            url: request.url,
            baseURL: request.baseURL,
            data: request.data,
            headers: request.headers,
        });
        return request;
    }, error => {
        console.error('🚀 Request Error:', error);
        return Promise.reject(error);
    });

    // Response logger
    apiClient.interceptors.response.use(
        response => {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
            return response;
        },
        error => {
            console.log('❌ API Error:', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.message,
                data: error.response?.data,
            });
            return Promise.reject(error);
        }
    );
}

// Export function to set auth token
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Setup additional interceptors (must be after debug interceptors)
setupInterceptors(apiClient);

// Function to reset the API client (useful after logout)
export const resetApiClient = () => {
    delete apiClient.defaults.headers.common['Authorization'];
};

// Function to initialize API client with stored token
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