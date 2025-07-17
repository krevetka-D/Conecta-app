// src/services/api/interceptors.js
import { resetRoot } from '../../navigation/NavigationService';
import { showErrorAlert } from '../../utils/alerts';
import { ERROR_MESSAGES } from '../../constants/messages';
import { SCREEN_NAMES } from '../../constants/routes';

export const setupInterceptors = (apiClient) => {
    // Request interceptor
    apiClient.interceptors.request.use(
        (config) => {
            // Add timestamp to prevent caching as a query parameter
            const timestamp = Date.now();

            // Create URL object to properly handle query parameters
            const url = new URL(config.url, config.baseURL);
            url.searchParams.append('_t', timestamp);

            // Update config.url with the relative path including query params
            config.url = `${url.pathname}${url.search}`;

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

            // Return only the data
            return response.data;
        },
        (error) => {
            if (__DEV__) {
                console.error('API Response Error:', error);
            }

            // Handle different error scenarios
            if (!error.response) {
                // Network error
                showErrorAlert('Network Error', ERROR_MESSAGES.NETWORK_ERROR);
                throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
            }

            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - redirect to login
                    resetRoot();
                    throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);

                case 403:
                    // Forbidden
                    throw new Error(data?.message || 'Access denied');

                case 404:
                    // Not found
                    throw new Error(data?.message || 'Resource not found');

                case 422:
                    // Validation error
                    throw new Error(data?.message || ERROR_MESSAGES.VALIDATION_ERROR);

                case 500:
                case 502:
                case 503:
                    // Server error
                    throw new Error(data?.message || 'Server error. Please try again later.');

                default:
                    // Generic error
                    throw new Error(data?.message || ERROR_MESSAGES.GENERIC_ERROR);
            }
        }
    );
};