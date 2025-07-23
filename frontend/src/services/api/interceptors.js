// frontend/src/services/api/interceptors.js
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ERROR_MESSAGES } from '../../constants/messages';
import { showErrorAlert } from '../../utils/alerts';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
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
            const isAuthEndpoint =
                config.url.includes('/login') || config.url.includes('/register');

            if (!isAuthEndpoint) {
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
        },
    );

    // Response interceptor - FIXED
    apiClient.interceptors.response.use(
        (response) => {
            if (__DEV__) {
                console.log('API Response:', {
                    url: response.config.url,
                    status: response.status,
                    data: response.data,
                });
            }

            // Handle both response.data and direct response formats
            if (response.data !== undefined) {
                return response.data;
            }
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            if (__DEV__) {
                console.error('API Response Error:', {
                    url: originalRequest?.url,
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                });
            }

            // Handle network errors
            if (!error.response) {
                return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
            }

            const { status, data } = error.response;

            // Check if this is a login/register request
            const isAuthRequest =
                originalRequest.url.includes('/login') || originalRequest.url.includes('/register');

            // Handle 401 Unauthorized
            if (status === 401 && !isAuthRequest) {
                if (!originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return apiClient(originalRequest);
                            })
                            .catch((err) => {
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
            const errorMessage = data?.message || data?.error || ERROR_MESSAGES.GENERIC_ERROR;
            return Promise.reject(new Error(errorMessage));
        },
    );
};
