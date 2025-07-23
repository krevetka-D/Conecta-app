import compression from 'compression';
import helmet from 'helmet';

// Query result caching
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheQuery = (key, data, ttl = CACHE_TTL) => {
    queryCache.set(key, {
        data,
        expires: Date.now() + ttl
    });
};

export const getCachedQuery = (key) => {
    const cached = queryCache.get(key);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    queryCache.delete(key);
    return null;
};

// Clean expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of queryCache.entries()) {
        if (value.expires < now) {
            queryCache.delete(key);
        }
    }
}, 60000); // Clean every minute

// Mongoose query optimization middleware
export const optimizeQueries = (schema) => {
    // Add lean() to queries by default for better performance
    schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
        if (!this.getOptions().lean) {
            this.lean();
        }
    });
    
    // Add query hints for commonly used queries
    schema.pre('find', function() {
        const query = this.getQuery();
        
        // If querying by user, use index hint
        if (query.user) {
            this.hint({ user: 1 });
        }
        
        // If querying by date range, use date index
        if (query.date || query.createdAt || query.updatedAt) {
            const dateField = query.date ? 'date' : (query.createdAt ? 'createdAt' : 'updatedAt');
            this.hint({ [dateField]: -1 });
        }
    });
};

// Response compression settings
export const compressionOptions = {
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balanced compression
    threshold: 1024, // Only compress responses > 1KB
    chunkSize: 16 * 1024,
    memLevel: 8,
};

// Security headers optimization
export const helmetOptions = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
};

// MongoDB aggregation pipeline optimizations
export const optimizeAggregation = (pipeline) => {
    const optimized = [...pipeline];
    
    // Move $match stages to the beginning when possible
    const matchStages = optimized.filter(stage => stage.$match);
    const otherStages = optimized.filter(stage => !stage.$match);
    
    // Add index hints for match stages
    matchStages.forEach(stage => {
        if (stage.$match.user) {
            stage.$match = { ...stage.$match, $hint: { user: 1 } };
        }
    });
    
    return [...matchStages, ...otherStages];
};

// Request batching for similar queries
const requestBatch = new Map();
const BATCH_WINDOW = 50; // 50ms window for batching

export const batchRequests = (key, resolver) => {
    if (!requestBatch.has(key)) {
        requestBatch.set(key, {
            promises: [],
            timer: setTimeout(async () => {
                const batch = requestBatch.get(key);
                requestBatch.delete(key);
                
                try {
                    const result = await resolver();
                    batch.promises.forEach(({ resolve }) => resolve(result));
                } catch (error) {
                    batch.promises.forEach(({ reject }) => reject(error));
                }
            }, BATCH_WINDOW)
        });
    }
    
    const batch = requestBatch.get(key);
    return new Promise((resolve, reject) => {
        batch.promises.push({ resolve, reject });
    });
};

// Connection pooling optimization
export const optimizeConnectionPool = (mongooseConnection) => {
    // Monitor pool events
    mongooseConnection.on('serverOpening', () => {
        console.log('MongoDB connection pool: Server connection opened');
    });
    
    mongooseConnection.on('serverClosed', () => {
        console.log('MongoDB connection pool: Server connection closed');
    });
    
    // Adjust pool size based on load
    const adjustPoolSize = () => {
        const stats = mongooseConnection.db.serverConfig.s.pool;
        const { size, minSize, maxSize } = stats;
        
        if (size < minSize * 2) {
            // Low usage, maintain minimum
            return;
        }
        
        if (size > maxSize * 0.8) {
            // High usage, consider scaling
            console.warn('Connection pool usage high:', { size, maxSize });
        }
    };
    
    setInterval(adjustPoolSize, 30000); // Check every 30 seconds
};

// Export all optimizations
export default {
    cacheQuery,
    getCachedQuery,
    optimizeQueries,
    compressionOptions,
    helmetOptions,
    optimizeAggregation,
    batchRequests,
    optimizeConnectionPool
};