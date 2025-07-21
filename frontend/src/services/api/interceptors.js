// frontend/src/services/api/interceptors.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showErrorAlert } from '../../utils/alerts';
import { ERROR_MESSAGES } from '../../constants/messages';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

export const setupInterceptors = (apiClient) => {
    // Request interceptor
    apiClient.interceptors.request.use(
        async (config) => {
            // Don't add auth header for login/register endpoints
            const isAuthEndpoint = config.url.includes('/login') || config.url.includes('/register');
            
            if (!isAuthEndpoint) {
                // Get fresh token for each request
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Error getting token for request:', error);
                }
            }

            // Add timestamp to prevent caching
            const timestamp = Date.now();
            const separator = config.url.includes('?') ? '&' : '?';
            config.url = `${config.url}${separator}_t=${timestamp}`;

            // Log request in development
            if (__DEV__) {
                console.log('API Request:', {
                    url: config.url,
                    method: config.method,
                    data: config.data,
                    headers: config.headers,
                });
            }

            return config;
        },
        (error) => {
            if (__DEV__) {
                console.error('API Request Error:', error);
            }
            return Promise.reject(error);
        }
    );

    // Response interceptor
    apiClient.interceptors.response.use(
        (response) => {
            // Log response in development
            if (__DEV__) {
                console.log('API Response:', {
                    url: response.config.url,
                    status: response.status,
                    data: response.data,
                });
            }

            // IMPORTANT: Return only the data from the response
            // This simplifies the response handling in services
            return response.data;
        },
        async (error) => {
            const originalRequest = error.config;

            if (__DEV__) {
                console.error('API Response Error:', {
                    url: originalRequest?.url,
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }

            // Handle network errors
            if (!error.response) {
                // Don't show alert for every network error, just return the error
                return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
            }

            const { status, data } = error.response;
            
            // Check if this is a login/register request
            const isAuthRequest = originalRequest.url.includes('/login') || 
                                 originalRequest.url.includes('/register');

            // Handle 401 Unauthorized
            if (status === 401) {
                // For login/register requests, don't treat as session expiration
                if (isAuthRequest) {
                    // Return the actual error message from backend
                    return Promise.reject(new Error(data?.message || ERROR_MESSAGES.LOGIN_FAILED));
                }
                
                // For other requests, treat as session expiration
                if (!originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return apiClient(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        // Clear auth data and redirect to login
                        await AsyncStorage.multiRemove(['userToken', 'user']);
                        
                        // Reset the default auth header
                        delete apiClient.defaults.headers.common['Authorization'];
                        
                        // Process the queue with error
                        processQueue(new Error('Session expired'), null);
                        
                        // Use setTimeout to ensure navigation is ready
                        setTimeout(() => {
                            // Import navigation service dynamically to avoid circular dependency
                            const { resetRoot } = require('../../navigation/NavigationService');
                            resetRoot();
                        }, 100);

                        return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }
            }

            // Handle other error statuses
            switch (status) {
                case 400:
                    // Bad request - often validation errors
                    // For registration, this might be "user already exists"
                    return Promise.reject(new Error(data?.message || data?.error || ERROR_MESSAGES.VALIDATION_ERROR));
                    
                case 403:
                    // Forbidden
                    return Promise.reject(new Error(data?.message || 'Access denied'));

                case 404:
                    // Not found
                    return Promise.reject(new Error(data?.message || 'Resource not found'));

                case 409:
                    // Conflict - often used for duplicate resources
                    return Promise.reject(new Error(data?.message || 'Resource already exists'));

                case 422:
                    // Validation error
                    return Promise.reject(new Error(data?.message || ERROR_MESSAGES.VALIDATION_ERROR));

                case 500:
                case 502:
                case 503:
                    // Server error - don't show alert here, let the service handle it
                    return Promise.reject(new Error(data?.message || 'Server error. Please try again later.'));

                default:
                    // Generic error - use backend message if available
                    return Promise.reject(new Error(data?.message || data?.error || ERROR_MESSAGES.GENERIC_ERROR));
            }
        }
    );
};