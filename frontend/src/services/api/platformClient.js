// frontend/src/services/api/platformClient.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const getBaseURL = () => {
  if (!__DEV__) {
    return 'https://api.conectaalicante.com/api';
  }

  // Development URLs
  if (Platform.OS === 'web') {
    return 'http://localhost:5001/api';
  }

  if (Platform.OS === 'android') {
    if (Device.isDevice) {
      // Physical Android device - use your computer's IP
      const debuggerHost = Constants.manifest?.debuggerHost || Constants.expoConfig?.debuggerHost;
      if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        return `http://${host}:5001/api`;
      }
      return 'http://192.168.1.100:5001/api'; // Replace with your IP
    } else {
      // Android emulator
      return 'http://10.0.2.2:5001/api';
    }
  }

  if (Platform.OS === 'ios') {
    if (Device.isDevice) {
      // Physical iOS device
      const debuggerHost = Constants.manifest?.debuggerHost || Constants.expoConfig?.debuggerHost;
      if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        return `http://${host}:5001/api`;
      }
      return 'http://192.168.1.100:5001/api'; // Replace with your IP
    } else {
      // iOS simulator
      return 'http://localhost:5001/api';
    }
  }

  return 'http://localhost:5001/api';
};

export const API_BASE_URL = getBaseURL();
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws').replace('/api', '');