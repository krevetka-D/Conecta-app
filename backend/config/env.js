// Centralized environment configuration

import dotenv from 'dotenv';
import path from 'path';

// Loading environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Validating required environment variables
const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'NODE_ENV'
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Configuration object

const config = {
    // Server
    port: process.env.PORT || 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Database
    database: {
        uri: process.env.MONGO_URI,
        options: {
            maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
            minPoolSize: parseInt(process.env.DB_POOL_MIN) || 2,
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 45000,
        }
    },

    // Authentication
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    },

    // CORS
    cors: {
        origins: process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:8081',
            'http://192.168.1.129:8081',
            'http://10.0.2.2:8081'
        ],
        credentials: true,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
        skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS === 'true',
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
        allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    },

    // Performance
    performance: {
        enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
        compressionLevel: parseInt(process.env.COMPRESSION_LEVEL) || 6,
        enableCache: process.env.ENABLE_CACHE !== 'false',
        cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 300,
    },

    // Redis
    redis: {
        url: process.env.REDIS_URL,
        ttl: parseInt(process.env.REDIS_TTL_DEFAULT) || 300,
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'conecta:',
    },

    // Features
    features: {
        forums: process.env.ENABLE_FORUMS !== 'false',
        events: process.env.ENABLE_EVENTS !== 'false',
        privateMessages: process.env.ENABLE_PRIVATE_MESSAGES === 'true',
        notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
        fileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs',
        enableMorgan: process.env.ENABLE_MORGAN !== 'false',
    }
};

// Validate on startup
validateEnv();

export default config;