import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// CORRECTED PATH:
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

// Request Interceptor to add the token to every request
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

setupInterceptors(apiClient);

export default apiClient;