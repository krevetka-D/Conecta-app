import { Platform } from 'react-native';
import * as Device from 'expo-device';

const getApiUrl = () => {
    if (__DEV__) {
        // Development URLs for different platforms
        if (Platform.OS === 'android') {
            if (Device.isDevice) {
                // Physical Android device - use your computer's IP
                return 'http://192.168.1.129:5001/api';
            } else {
                // Android emulator
                return 'http://10.0.2.2:5001/api';
            }
        } else if (Platform.OS === 'ios') {
            // iOS simulator or device
            return 'http://192.168.1.129:5001/api';
        } else {
            // Web
            return 'http://localhost:5001/api';
        }
    } else {
        // Production URL
        return 'https://api.conectaalicante.com/api';
    }
};

export const API_BASE_URL = getApiUrl();