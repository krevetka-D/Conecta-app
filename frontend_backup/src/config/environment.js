// frontend/src/config/environment.js
import Constants from 'expo-constants';

const ENV = {
    development: {
        API_BASE_URL: 'http://192.168.1.129:5001/api',
        WS_BASE_URL: 'ws://192.168.1.129:5001',
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
    }
};

const getEnvironment = () => {
    const releaseChannel = Constants.manifest?.releaseChannel;
    
    if (releaseChannel === 'production') return 'production';
    if (releaseChannel === 'staging') return 'staging';
    return 'development';
};

const currentEnv = getEnvironment();

export default {
    ...ENV[currentEnv],
    // Additional config
    APP_VERSION: Constants.manifest?.version || '1.0.0',
    ENVIRONMENT: currentEnv,
};