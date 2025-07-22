// Centralized environment configuration with validation and defaults

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, '..', envFile);
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== 'production') {
    console.warn(`Warning: ${envFile} file not found. Using default values.`);
}

// Default values for development
const defaults = {
    PORT: 5001,
    NODE_ENV: 'development',
    JWT_SECRET: 'dev-secret-change-in-production',
    JWT_EXPIRES_IN: '30d',
    JWT_REFRESH_EXPIRES_IN: '90d',
    BCRYPT_ROUNDS: 12,
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    MAX_FILE_SIZE: 10485760,
    DB_POOL_SIZE: 10,
    DB_POOL_MIN: 2,
    DB_SERVER_SELECTION_TIMEOUT_MS: 5000,
    DB_SOCKET_TIMEOUT_MS: 45000,
    SOCKET_PING_TIMEOUT: 60000,
    SOCKET_PING_INTERVAL: 25000,
    SOCKET_MAX_HTTP_BUFFER_SIZE: 1e6,
    LOG_LEVEL: 'info',
    COMPRESSION_LEVEL: 6,
    CACHE_TTL_SECONDS: 300,
};

// Get environment variable with type conversion and default
const getEnvVar = (key, defaultValue, type = 'string') => {
    const value = process.env[key] || defaultValue;
    
    switch (type) {
        case 'number':
            return parseInt(value) || defaultValue;
        case 'boolean':
            return value === 'true' || value === true;
        case 'array':
            return value ? value.split(',').map(item => item.trim()) : [];
        default:
            return value;
    }
};

// Validate required environment variables
const validateEnv = () => {
    const required = ['MONGO_URI'];
    const missing = [];
    
    for (const varName of required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    
    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please create a .env file with the required variables.');
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
    
    // Warnings for development
    if (process.env.NODE_ENV !== 'production') {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaults.JWT_SECRET) {
            console.warn('⚠️  Using default JWT_SECRET. This is insecure for production!');
        }
    }
};

// Configuration object
const config = {
    // Server
    port: getEnvVar('PORT', defaults.PORT, 'number'),
    nodeEnv: getEnvVar('NODE_ENV', defaults.NODE_ENV),
    isDevelopment: getEnvVar('NODE_ENV', defaults.NODE_ENV) === 'development',
    isProduction: getEnvVar('NODE_ENV', defaults.NODE_ENV) === 'production',
    
    // Database
    database: {
        uri: getEnvVar('MONGO_URI', ''),
        options: {
            maxPoolSize: getEnvVar('DB_POOL_SIZE', defaults.DB_POOL_SIZE, 'number'),
            minPoolSize: getEnvVar('DB_POOL_MIN', defaults.DB_POOL_MIN, 'number'),
            serverSelectionTimeoutMS: getEnvVar('DB_SERVER_SELECTION_TIMEOUT_MS', defaults.DB_SERVER_SELECTION_TIMEOUT_MS, 'number'),
            socketTimeoutMS: getEnvVar('DB_SOCKET_TIMEOUT_MS', defaults.DB_SOCKET_TIMEOUT_MS, 'number'),
        }
    },
    
    // Authentication
    auth: {
        jwtSecret: getEnvVar('JWT_SECRET', defaults.JWT_SECRET),
        jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', defaults.JWT_EXPIRES_IN),
        jwtRefreshSecret: getEnvVar('JWT_REFRESH_SECRET', getEnvVar('JWT_SECRET', defaults.JWT_SECRET)),
        jwtRefreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', defaults.JWT_REFRESH_EXPIRES_IN),
        bcryptRounds: getEnvVar('BCRYPT_ROUNDS', defaults.BCRYPT_ROUNDS, 'number'),
        adminSecretKey: getEnvVar('ADMIN_SECRET_KEY', ''),
    },
    
    // CORS
    cors: {
        origins: getEnvVar('ALLOWED_ORIGINS', '', 'array'),
        credentials: true,
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: getEnvVar('RATE_LIMIT_WINDOW_MS', defaults.RATE_LIMIT_WINDOW_MS, 'number'),
        max: getEnvVar('RATE_LIMIT_MAX_REQUESTS', defaults.RATE_LIMIT_MAX_REQUESTS, 'number'),
        skipSuccessfulRequests: getEnvVar('RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS', false, 'boolean'),
        skipFailedRequests: getEnvVar('RATE_LIMIT_SKIP_FAILED_REQUESTS', true, 'boolean'),
    },
    
    // File Upload
    upload: {
        maxFileSize: getEnvVar('MAX_FILE_SIZE', defaults.MAX_FILE_SIZE, 'number'),
        allowedFileTypes: getEnvVar('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,pdf,doc,docx', 'array'),
        maxUploadSizeMB: getEnvVar('MAX_UPLOAD_SIZE_MB', 10, 'number'),
    },
    
    // Performance
    performance: {
        enableCompression: getEnvVar('ENABLE_COMPRESSION', true, 'boolean'),
        compressionLevel: getEnvVar('COMPRESSION_LEVEL', defaults.COMPRESSION_LEVEL, 'number'),
        enableCache: getEnvVar('ENABLE_CACHE', true, 'boolean'),
        cacheTTL: getEnvVar('CACHE_TTL_SECONDS', defaults.CACHE_TTL_SECONDS, 'number'),
    },
    
    // Socket.IO
    socket: {
        pingTimeout: getEnvVar('SOCKET_PING_TIMEOUT', defaults.SOCKET_PING_TIMEOUT, 'number'),
        pingInterval: getEnvVar('SOCKET_PING_INTERVAL', defaults.SOCKET_PING_INTERVAL, 'number'),
        maxHttpBufferSize: getEnvVar('SOCKET_MAX_HTTP_BUFFER_SIZE', defaults.SOCKET_MAX_HTTP_BUFFER_SIZE, 'number'),
    },
    
    // Features
    features: {
        forums: getEnvVar('ENABLE_FORUMS', true, 'boolean'),
        events: getEnvVar('ENABLE_EVENTS', true, 'boolean'),
        privateMessages: getEnvVar('ENABLE_PRIVATE_MESSAGES', false, 'boolean'),
        notifications: getEnvVar('ENABLE_NOTIFICATIONS', false, 'boolean'),
        fileUploads: getEnvVar('ENABLE_FILE_UPLOADS', true, 'boolean'),
    },
    
    // Logging
    logging: {
        level: getEnvVar('LOG_LEVEL', defaults.LOG_LEVEL),
        filePath: getEnvVar('LOG_FILE_PATH', './logs'),
        enableMorgan: getEnvVar('ENABLE_MORGAN', true, 'boolean'),
    },
    
    // Frontend
    frontend: {
        url: getEnvVar('FRONTEND_URL', 'http://localhost:8081'),
        devUrl: getEnvVar('FRONTEND_URL_DEV', ''),
        devIps: getEnvVar('DEV_IPS', '', 'array'),
    }
};

// Validate on startup
validateEnv();

// Log configuration in development
if (config.isDevelopment) {
    console.log('🔧 Configuration loaded:');
    console.log(`- Environment: ${config.nodeEnv}`);
    console.log(`- Port: ${config.port}`);
    console.log(`- Database: ${config.database.uri ? 'Connected' : 'Not configured'}`);
    console.log(`- Features: ${Object.entries(config.features).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
}

export default config;
export { getEnvVar, validateEnv };