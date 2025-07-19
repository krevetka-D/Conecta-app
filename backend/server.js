// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import configRoutes from './routes/configRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// Import performance middleware
import { 
    performanceMonitor, 
    payloadSizeLimiter, 
    advancedRateLimiter,
    getPerformanceMetrics 
} from './middleware/performanceMiddleware.js';

dotenv.config();

const app = express();

// Connect to MongoDB with optimized settings
connectDB();

// Trust proxy for rate limiting to work behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:8081', 'http://192.168.1.129:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
}));

// Compression middleware
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// MongoDB injection prevention
app.use(mongoSanitize({
    replaceWith: '_'
}));

// Rate limiting with custom configuration
app.use('/api/', advancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    }
}));

// Logging (disable in production for performance)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    // Use a custom format in production that logs less
    app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
}

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring
app.use(performanceMonitor);
app.use(payloadSizeLimiter(10 * 1024 * 1024)); // 10MB limit

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/events', eventRoutes);

// Performance metrics endpoint (protected in production)
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/metrics', getPerformanceMetrics);
}

// Health check endpoint with more detailed info
app.get('/api/health', async (req, res) => {
    const healthcheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        mongodb: 'disconnected'
    };

    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState === 1) {
            healthcheck.mongodb = 'connected';
        }
    } catch (error) {
        healthcheck.mongodb = 'error';
    }

    res.json(healthcheck);
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Conecta Alicante API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
    📡 Port: ${PORT}
    🌐 URL: http://localhost:${PORT}
    📊 Metrics: ${process.env.NODE_ENV !== 'production' ? `http://localhost:${PORT}/api/metrics` : 'Disabled in production'}
    `);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
        console.log('✅ HTTP server closed');
    });

    // Close database connection
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
    }

    // Exit process
    process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    console.error(err.stack);
    
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Import mongoose for health check
import mongoose from 'mongoose';

export default server;