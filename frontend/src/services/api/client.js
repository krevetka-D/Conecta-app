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
    // Enable automatic retries for network errors
    retry: 3,
    retryDelay: 1000,
});

// Track request/response for debugging
if (__DEV__) {
    apiClient.interceptors.request.use(request => {
        console.log('🚀 API Request:', {
            method: request.method?.toUpperCase(),
            url: request.url,
            baseURL: request.baseURL,
            data: request.data,
        });
        return request;
    });

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

// Enhanced request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add request timestamp for caching
            config.metadata = { startTime: new Date() };

            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            return config;
        }
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Enhanced response interceptor for timing
apiClient.interceptors.response.use(
    (response) => {
        if (response.config.metadata) {
            response.config.metadata.endTime = new Date();
            response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
        }
        return response;
    },
    (error) => {
        if (error.config?.metadata) {
            error.config.metadata.endTime = new Date();
            error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
        }
        return Promise.reject(error);
    }
);

// Setup additional interceptors
setupInterceptors(apiClient);

// Add retry logic for failed requests
apiClient.interceptors.response.use(undefined, async (error) => {
    const { config } = error;

    if (!config || !config.retry) {
        return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= config.retry) {
        return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Exponential backoff
    const delay = config.retryDelay * Math.pow(2, config.__retryCount - 1);

    await new Promise(resolve => setTimeout(resolve, delay));

    return apiClient(config);
});

export default apiClient;