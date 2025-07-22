import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import socketHandlers from './socket/socketHandlers.js';
import User from './models/User.js';
import { performanceMonitor } from './middleware/performanceMiddleware.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import configRoutes from './routes/configRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Connect to database with retry logic
const initializeDatabase = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:5001',
            'http://localhost:8081',
            'http://localhost:19000',
            'http://localhost:19001',
            'http://localhost:19002',
            'http://localhost:19006',
            'exp://localhost:19000',
            'exp://localhost:8081',
            'http://192.168.1.129:8081',
            'http://192.168.1.129:19000',
            'exp://192.168.1.129:8081',
        ];
        
        // Dynamic IP patterns
        const allowedPatterns = [
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
            /^exp:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
            /^exp:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
            /^http:\/\/localhost:\d+$/,
            /^exp:\/\/localhost:\d+$/,
        ];
        
        // Allow requests with no origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        
        // Check exact matches
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Check patterns
        const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
        
        if (isAllowed || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page', 'X-Cache', 'X-Response-Time'],
    maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply middleware
app.use(cors(corsOptions));
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(performanceMonitor);
}

// Request logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/config', configRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint with more details
app.get('/api/health', (req, res) => {
    const healthcheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(healthcheck);
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO configuration
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 1e6,
    path: '/socket.io/',
    allowEIO3: true,
    perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
            chunkSize: 16 * 1024,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
    }
});

// Socket authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                socket.userId = 'anonymous-' + Date.now();
                return next();
            }
            return next(new Error('Authentication required'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password').lean();
        
        if (!user) {
            return next(new Error('User not found'));
        }
        
        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        if (process.env.NODE_ENV === 'development') {
            socket.userId = 'anonymous-' + Date.now();
            return next();
        }
        next(new Error('Authentication failed'));
    }
});

// Setup socket handlers
socketHandlers(io);

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    httpServer.close(() => {
        console.log('HTTP server closed');
    });
    
    // Close all socket connections
    io.close(() => {
        console.log('Socket.IO server closed');
    });
    
    // Close database connection
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database:', error);
    }
    
    // Exit process
    process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Attempt graceful shutdown
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start server
const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0';

const startServer = async () => {
    try {
        await initializeDatabase();
        
        httpServer.listen(PORT, HOST, () => {
            console.log(`✅ Server running in ${process.env.NODE_ENV} mode`);
            console.log(`📡 Listening on ${HOST}:${PORT}`);
            console.log(`🔌 Socket.IO server ready`);
            console.log(`🚀 API available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export { io };