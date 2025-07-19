// frontend/src/config/network.js
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import env from './environment';

const getApiUrl = () => {
    if (__DEV__) {
        // Development URLs for different platforms
        if (Platform.OS === 'android') {
            if (Device.isDevice) {
                // Physical Android device - use your computer's IP
                return env.API_BASE_URL;
            } else {
                // Android emulator
                return env.ANDROID_EMULATOR_API_URL;
            }
        } else if (Platform.OS === 'ios') {
            if (Device.isDevice) {
                // Physical iOS device
                return env.API_BASE_URL;
            } else {
                // iOS simulator
                return env.IOS_SIMULATOR_API_URL;
            }
        } else {
            // Web
            return env.API_BASE_URL;
        }
    } else {
        // Production URL
        return env.API_BASE_URL;
    }
};

export const API_BASE_URL = getApiUrl();
export const WS_BASE_URL = env.WS_BASE_URL;