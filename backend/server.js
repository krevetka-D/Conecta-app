import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import User from './models/User.js';

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

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

//CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5001',
            'http://localhost:8081',
            'http://localhost:19000',
            'http://localhost:19001',
            'http://localhost:19002',
            'http://localhost:19006',
            'exp://localhost:19000',
            'exp://localhost:8081',
            // Add your Mac's IP for development
            'http://192.168.1.129:8081',
            'http://192.168.1.129:19000',
            'http://192.168.1.129:19001',
            'http://192.168.1.129:19002',
            'exp://192.168.1.129:8081',
            'exp://192.168.1.129:19000',
            // Allow any IP in your local network range
            /^http:\/\/192\.168\.1\.\d{1,3}:\d+$/,
            /^exp:\/\/192\.168\.1\.\d{1,3}:\d+$/,
            // General patterns for Expo
            /^exp:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,
            /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/
        ];
        
        // Allow requests with no origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        
        // In development, log all origins for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('CORS request from origin:', origin);
        }
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            // In development, allow all origins for easier testing
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/config', configRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO configuration with error handling
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true,
    maxHttpBufferSize: 1e8, // 100 MB
    path: '/socket.io/',
    serveClient: false,
    cookie: false,
    
    // Additional options for stability
    allowUpgrades: true,
    perMessageDeflate: {
        threshold: 1024
    },
    httpCompression: {
        threshold: 1024
    }
});

// Socket authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            console.log('Socket auth: No token provided');
            // Allow connection without auth for development
            if (process.env.NODE_ENV === 'development') {
                socket.userId = 'anonymous';
                return next();
            }
            return next(new Error('Authentication error: No token provided'));
        }
        
        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                console.log('Socket auth: User not found');
                return next(new Error('Authentication error: User not found'));
            }
            
            socket.userId = user._id.toString();
            socket.user = user;
            console.log(`Socket authenticated for user: ${user.name}`);
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError.message);
            if (process.env.NODE_ENV === 'development') {
                socket.userId = 'anonymous';
                return next();
            }
            return next(new Error('Authentication error: Invalid token'));
        }
    } catch (error) {
        console.error('Socket authentication error:', error);
        if (process.env.NODE_ENV === 'development') {
            socket.userId = 'anonymous';
            return next();
        }
        next(new Error('Authentication error: Invalid token'));
    }
});

// Setup socket handlers
setupSocketHandlers(io);

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Graceful shutdown
    httpServer.close(() => {
        process.exit(1);
    });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.IO server ready`);
});

export { io };