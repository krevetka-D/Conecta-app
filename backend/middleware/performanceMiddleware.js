
import logger from '../utils/logger.js';

// Performance metrics storage
const metrics = {
    requests: new Map(),
    slowQueries: [],
    errorRates: new Map()
};

export const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl;
    const requestId = `${Date.now()}-${Math.random()}`;

    // Store request start time
    metrics.requests.set(requestId, {
        method,
        url,
        start,
        ip: req.ip
    });

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        // Remove from active requests
        metrics.requests.delete(requestId);

        // Log slow requests (> 1000ms)
        if (duration > 1000) {
            const slowRequest = {
                method,
                url,
                duration,
                statusCode,
                timestamp: new Date()
            };
            metrics.slowQueries.push(slowRequest);
            
            // Keep only last 100 slow queries
            if (metrics.slowQueries.length > 100) {
                metrics.slowQueries.shift();
            }

            logger.warn(`Slow request detected: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Track error rates
        if (statusCode >= 400) {
            const errorKey = `${method}_${url}_${statusCode}`;
            metrics.errorRates.set(errorKey, (metrics.errorRates.get(errorKey) || 0) + 1);
        }

        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', requestId);

        // Log all requests in development
        if (process.env.NODE_ENV === 'development') {
            logger.info(`${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Call original end
        originalEnd.apply(res, args);
    };

    next();
};

// Requesting payload size limiter
export const payloadSizeLimiter = (maxSize = 10485760) => { // 10MB default
    return (req, res, next) => {
        let size = 0;
        let aborted = false;
        
        req.on('data', (chunk) => {
            if (aborted) return;
            
            size += chunk.length;
            
            if (size > maxSize) {
                aborted = true;
                res.status(413).json({
                    error: 'Payload too large',
                    maxSize: `${maxSize / 1024 / 1024}MB`,
                    receivedSize: `${(size / 1024 / 1024).toFixed(2)}MB`
                });
                req.connection.destroy();
            }
        });

        req.on('aborted', () => {
            aborted = true;
        });
        
        next();
    };
};

// Query complexity analyzer for MongoDB
export const queryComplexityAnalyzer = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return next();
    }

    // Monitor MongoDB queries in development
    const originalFind = mongoose.Query.prototype.find;
    const originalFindOne = mongoose.Query.prototype.findOne;

    mongoose.Query.prototype.find = function(...args) {
        const start = Date.now();
        const result = originalFind.apply(this, args);
        
        result.then(() => {
            const duration = Date.now() - start;
            if (duration > 100) {
                logger.warn(`Slow MongoDB query: find() took ${duration}ms`, {
                    collection: this.model.collection.name,
                    filter: this.getFilter()
                });
            }
        });

        return result;
    };

    mongoose.Query.prototype.findOne = function(...args) {
        const start = Date.now();
        const result = originalFindOne.apply(this, args);
        
        result.then(() => {
            const duration = Date.now() - start;
            if (duration > 50) {
                logger.warn(`Slow MongoDB query: findOne() took ${duration}ms`, {
                    collection: this.model.collection.name,
                    filter: this.getFilter()
                });
            }
        });

        return result;
    };

    next();
};

// API rate limiting with Redis support (future enhancement)
export const advancedRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // limit each IP to 100 requests per windowMs
        keyGenerator = (req) => req.ip,
        skipSuccessfulRequests = false,
        skipFailedRequests = false
    } = options;

    const hits = new Map();

    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create hit list for this key
        if (!hits.has(key)) {
            hits.set(key, []);
        }

        const hitList = hits.get(key);
        
        // Remove old entries
        const validHits = hitList.filter(timestamp => timestamp > windowStart);
        hits.set(key, validHits);

        // Check if limit exceeded
        if (validHits.length >= max) {
            const retryAfter = Math.ceil((validHits[0] + windowMs - now) / 1000);
            
            res.setHeader('Retry-After', retryAfter);
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', new Date(validHits[0] + windowMs).toISOString());

            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: `${retryAfter} seconds`
            });
        }

        // Add current request
        validHits.push(now);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - validHits.length);
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

        // Optionally skip counting based on response
        const originalEnd = res.end;
        res.end = function(...args) {
            if ((skipSuccessfulRequests && res.statusCode < 400) ||
                (skipFailedRequests && res.statusCode >= 400)) {
                validHits.pop(); // Remove this request from count
            }
            originalEnd.apply(res, args);
        };

        next();
    };
};

// Performance metrics endpoint
export const getPerformanceMetrics = (req, res) => {
    res.json({
        activeRequests: metrics.requests.size,
        slowQueries: metrics.slowQueries.slice(-20), // Last 20 slow queries
        errorRates: Object.fromEntries(metrics.errorRates),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
    });
};