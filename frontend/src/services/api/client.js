// src/services/api/client.js
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { setupInterceptors } from './interceptors';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Setup interceptors
setupInterceptors(apiClient);

// Helper methods
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export const setBaseURL = (url) => {
    apiClient.defaults.baseURL = url;
};

export const setTimeout = (timeout) => {
    apiClient.defaults.timeout = timeout;
};

export default apiClient;