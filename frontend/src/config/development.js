// Development configuration
export const DEV_CONFIG = {
    // Set to true to use mock services instead of real backend
    USE_MOCK_SERVICES: false,
    
    // Set to true to attempt WebSocket connections
    USE_WEBSOCKET: true,
    
    // Mock user for development
    MOCK_USER: {
        _id: 'current-user',
        name: 'Test User',
        email: 'test@example.com',
        professionalPath: 'FREELANCER'
    },
    
    // Development API endpoints
    API_ENDPOINTS: {
        // Override specific endpoints for development if needed
    },
    
    // Console logging
    ENABLE_LOGGING: true,
    LOG_NETWORK_REQUESTS: true,
    LOG_SOCKET_EVENTS: true,
};

// Export convenience flags
export const USE_MOCK = __DEV__ && DEV_CONFIG.USE_MOCK_SERVICES;
export const USE_WEBSOCKET = !__DEV__ || DEV_CONFIG.USE_WEBSOCKET;
export const ENABLE_LOGGING = __DEV__ && DEV_CONFIG.ENABLE_LOGGING;

// Development logger
export const devLog = (category, message, ...args) => {
    if (ENABLE_LOGGING) {
        console.log(`[${category}]`, message, ...args);
    }
};

export default DEV_CONFIG;