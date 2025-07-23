// frontend/src/config/environment.js
import Constants from 'expo-constants';
import * as Network from 'expo-network';

const ENV = {
    development: {
        // Use localhost for web and dynamic detection for mobile
        API_BASE_URL: __DEV__ ? 'http://localhost:5001/api' : 'https://api.conectaalicante.com/api',
        WS_BASE_URL: __DEV__ ? 'ws://localhost:5001' : 'wss://api.conectaalicante.com',
        ANDROID_EMULATOR_API_URL: 'http://10.0.2.2:5001/api',
        IOS_SIMULATOR_API_URL: 'http://localhost:5001/api',
    },
    staging: {
        API_BASE_URL: 'https://staging-api.conectaalicante.com/api',
        WS_BASE_URL: 'wss://staging-api.conectaalicante.com',
    },
    production: {
        API_BASE_URL: 'https://api.conectaalicante.com/api',
        WS_BASE_URL: 'wss://api.conectaalicante.com',
    },
};

const getEnvironment = () => {
    // Use Expo's manifest to determine environment
    const releaseChannel =
        Constants.manifest?.releaseChannel || Constants.expoConfig?.releaseChannel;

    if (releaseChannel === 'production') return 'production';
    if (releaseChannel === 'staging') return 'staging';
    return 'development';
};

const currentEnv = getEnvironment();

// Get dynamic host URL for development
const getDevUrl = () => {
    if (__DEV__ && Constants.manifest?.debuggerHost) {
        const debuggerHost = Constants.manifest.debuggerHost;
        const host = debuggerHost.split(':')[0];
        return `http://${host}:5001/api`;
    }
    return ENV.development.API_BASE_URL;
};

export default {
    ...ENV[currentEnv],
    API_BASE_URL: __DEV__ ? getDevUrl() : ENV[currentEnv].API_BASE_URL,
    APP_VERSION: Constants.manifest?.version || Constants.expoConfig?.version || '1.0.0',
    ENVIRONMENT: currentEnv,
};
