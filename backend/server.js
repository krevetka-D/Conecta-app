import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Import your existing routes
import userRoutes from './routes/userRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import configRoutes from './routes/configRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // New chat routes

import { performanceMonitor, payloadSizeLimiter } from './middleware/performanceMiddleware.js';

dotenv.config();

const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Trust proxy for rate limiting to work behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    // Allow WebSocket connections
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? [process.env.FRONTEND_URL]
            : ['http://localhost:8081', 'http://192.168.1.129:8081', 'http://localhost:19006', 'http://localhost:3000'];
        
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(compression());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Socket.IO rate limiting
const socketLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 socket events per minute
    message: 'Too many socket requests from this IP, please try again later.',
});

// Logging (disable in production)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring
app.use(performanceMonitor);
app.use(payloadSizeLimiter());

// --- Mount your API routes here ---
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes); // New chat routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        socketStatus: io ? 'Connected' : 'Disconnected',
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Conecta Alicante API is running',
        version: '2.0.0', // Updated for chat feature
        features: ['forums', 'events', 'budget', 'checklist', 'chat']
    });
});

// --- Socket.IO Setup ---
const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true, // Allow different Socket.IO versions
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // You could also fetch the user from database here
        socket.userId = decoded.id;
        socket.decoded = decoded;
        
        // Apply rate limiting to socket connections
        const clientIp = socket.request.connection.remoteAddress;
        req = { ip: clientIp };
        
        socketLimiter(req, {}, (err) => {
            if (err) {
                return next(new Error('Too many socket connections'));
            }
            next();
        });
    } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Setup socket handlers
setupSocketHandlers(io);

// Log socket connections in development
if (process.env.NODE_ENV !== 'production') {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.userId})`);
        
        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
        });
    });
}

// --- Error Handling Middleware should be last ---
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🔌 Socket.IO is enabled`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Close Socket.IO connections
    io.close(() => {
        console.log('Socket.IO connections closed');
    });
    
    // Close HTTP server
    httpServer.close(() => {
        console.log('HTTP server closed');
        
        // Close database connection
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Promise Rejection: ${err.message}`);
    console.error(err.stack);
    
    // Close server & exit process
    httpServer.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    
    // Close server & exit process
    httpServer.close(() => {
        process.exit(1);
    });
});

// Export for testing purposes
export { app, httpServer, io };