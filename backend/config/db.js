import mongoose from 'mongoose';

const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    // Connection settings optimized for stability
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 45000,
        family: 4, // Use IPv4, skip trying IPv6

        // Connection pool settings - optimized for better performance
        maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 50,
        minPoolSize: parseInt(process.env.DB_POOL_MIN) || 10,
        maxIdleTimeMS: 10000,
        waitQueueTimeoutMS: 10000,

        // Write concern
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeout: 1000
        },
        
        // Read preference
        readPreference: 'primaryPreferred',
        readConcern: { level: 'majority' },
        
        // Retry settings
        retryWrites: true,
        retryReads: true,
        
        // Compression
        compressors: ['zlib'],
        zlibCompressionLevel: 6,
    };

    // Mongoose settings
    mongoose.set('strictQuery', true);
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');
    mongoose.set('autoCreate', true);

    while (retries < maxRetries) {
        try {
            console.log(`Connecting to MongoDB (attempt ${retries + 1}/${maxRetries})...`);
            
            const conn = await mongoose.connect(process.env.MONGO_URI, options);

            const { host, port, name } = conn.connection;
            console.log(`✅ MongoDB Connected: ${host}:${port}/${name}`);
            console.log(`📊 Connection state: ${conn.connection.readyState}`);
            
            // Import models to ensure they're registered
            await import('../models/User.js');
            await import('../models/Event.js');
            await import('../models/Forum.js');
            await import('../models/ChatMessage.js');
            await import('../models/BudgetEntry.js');
            await import('../models/ChecklistItem.js');
            await import('../models/Guide.js');
            
            // Create indexes in background
            if (process.env.CREATE_INDEXES === 'true') {
                const { createDatabaseIndexes } = await import('../utils/databaseOptimization.js');
                createDatabaseIndexes().catch(console.error);
            }
            
            // Enable slow query logging in development
            if (process.env.NODE_ENV === 'development') {
                const { enableSlowQueryLogging } = await import('../utils/databaseOptimization.js');
                enableSlowQueryLogging();
            }

            // Connection event handlers
            mongoose.connection.on('connected', () => {
                console.log('Mongoose connected to MongoDB');
            });

            mongoose.connection.on('error', (err) => {
                console.error('Mongoose connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose disconnected from MongoDB');
                // Attempt to reconnect unless we're shutting down
                if (!process.env.SHUTTING_DOWN) {
                    setTimeout(() => {
                        console.log('Attempting to reconnect to MongoDB...');
                        mongoose.connect(process.env.MONGO_URI, options);
                    }, 5000);
                }
            });

            // Monitor connection
            mongoose.connection.on('reconnected', () => {
                console.log('Mongoose reconnected to MongoDB');
            });

            mongoose.connection.on('close', () => {
                console.log('Mongoose connection closed');
            });

            // Enable profiling in development
            if (process.env.NODE_ENV === 'development') {
                mongoose.connection.on('all', () => {
                    console.log('Mongoose connection pool event');
                });
            }

            return conn;
        } catch (error) {
            retries++;
            console.error(`Database Connection Error (Attempt ${retries}/${maxRetries}):`, {
                message: error.message,
                code: error.code,
                name: error.name
            });

            if (retries === maxRetries) {
                console.error('❌ Max retries reached. Unable to connect to MongoDB.');
                console.error('Please check:');
                console.error('1. MongoDB is running');
                console.error('2. Connection string is correct');
                console.error('3. Network connectivity');
                console.error('4. Database user permissions');
                throw error;
            }

            // Exponential backoff with jitter
            const baseDelay = 1000;
            const maxDelay = 30000;
            const jitter = Math.random() * 1000;
            const delay = Math.min(baseDelay * Math.pow(2, retries - 1) + jitter, maxDelay);
            
            console.log(`⏳ Retrying in ${Math.round(delay / 1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Helper function to check database health
export const checkDatabaseHealth = async () => {
    try {
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.ping();
        
        return {
            connected: mongoose.connection.readyState === 1,
            readyState: mongoose.connection.readyState,
            ping: result,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            models: Object.keys(mongoose.models).length
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
};

// Helper function to get connection statistics
export const getConnectionStats = () => {
    const { readyState, host, port, name } = mongoose.connection;
    
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    
    return {
        state: states[readyState] || 'unknown',
        host,
        port,
        database: name,
        models: Object.keys(mongoose.models),
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : []
    };
};

export default connectDB;