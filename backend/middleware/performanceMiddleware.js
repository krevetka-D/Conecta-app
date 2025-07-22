import mongoose from 'mongoose';

// Performance metrics storage
const metrics = {
    requests: new Map(),
    slowQueries: [],
    errorRates: new Map(),
    apiStats: new Map()
};

export const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl;
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store request start time
    metrics.requests.set(requestId, {
        method,
        url,
        start,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Clean up old requests (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, request] of metrics.requests) {
        if (request.start < fiveMinutesAgo) {
            metrics.requests.delete(id);
        }
    }

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        // Remove from active requests
        metrics.requests.delete(requestId);

        // Update API statistics
        const apiKey = `${method}_${url.split('?')[0]}`;
        if (!metrics.apiStats.has(apiKey)) {
            metrics.apiStats.set(apiKey, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0,
                errors: 0
            });
        }

        const stats = metrics.apiStats.get(apiKey);
        stats.count++;
        stats.totalTime += duration;
        stats.avgTime = stats.totalTime / stats.count;
        stats.minTime = Math.min(stats.minTime, duration);
        stats.maxTime = Math.max(stats.maxTime, duration);
        if (statusCode >= 400) stats.errors++;

        // Log slow requests (> 1000ms)
        if (duration > 1000) {
            const slowRequest = {
                method,
                url,
                duration,
                statusCode,
                timestamp: new Date(),
                userAgent: req.get('user-agent')
            };
            metrics.slowQueries.push(slowRequest);
            
            // Keep only last 100 slow queries
            if (metrics.slowQueries.length > 100) {
                metrics.slowQueries.shift();
            }

            console.warn(`⚠️ Slow request: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Track error rates
        if (statusCode >= 400) {
            const errorKey = `${method}_${url}_${statusCode}`;
            metrics.errorRates.set(errorKey, (metrics.errorRates.get(errorKey) || 0) + 1);
        }

        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', requestId);

        // Log in development
        if (process.env.NODE_ENV === 'development' && duration > 100) {
            console.log(`📊 ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Call original end
        originalEnd.apply(res, args);
    };

    next();
};

// Payload size limiter
export const payloadSizeLimiter = (maxSize = 10485760) => { // 10MB default
    return (req, res, next) => {
        let size = 0;
        
        req.on('data', (chunk) => {
            size += chunk.length;
            
            if (size > maxSize) {
                res.status(413).json({
                    success: false,
                    error: 'Payload too large',
                    maxSize: `${maxSize / 1024 / 1024}MB`,
                    receivedSize: `${(size / 1024 / 1024).toFixed(2)}MB`
                });
                req.destroy();
            }
        });
        
        next();
    };
};

// MongoDB query monitor (development only)
export const setupQueryMonitoring = () => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor slow queries
    mongoose.set('debug', (collectionName, method, query, doc, options) => {
        const start = Date.now();
        
        // Use nextTick to measure after query execution
        process.nextTick(() => {
            const duration = Date.now() - start;
            if (duration > 100) {
                console.warn(`⚠️ Slow MongoDB query: ${collectionName}.${method}() took ${duration}ms`, {
                    query: JSON.stringify(query).slice(0, 200),
                    options
                });
            }
        });
    });
};

// API rate limiter
export const apiRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100,
        message = 'Too many requests',
        keyGenerator = (req) => req.ip || 'unknown',
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        handler = null
    } = options;

    const hits = new Map();

    // Cleanup old entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, timestamps] of hits) {
            const validTimestamps = timestamps.filter(t => t > now - windowMs);
            if (validTimestamps.length === 0) {
                hits.delete(key);
            } else {
                hits.set(key, validTimestamps);
            }
        }
    }, windowMs);

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

            if (handler) {
                return handler(req, res, next);
            }

            return res.status(429).json({
                success: false,
                error: message,
                retryAfter: `${retryAfter} seconds`
            });
        }

        // Add current request
        validHits.push(now);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - validHits.length);
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

        // Handle skip options
        const originalEnd = res.end;
        res.end = function(...args) {
            if ((skipSuccessfulRequests && res.statusCode < 400) ||
                (skipFailedRequests && res.statusCode >= 400)) {
                validHits.pop();
            }
            originalEnd.apply(res, args);
        };

        next();
    };
};

// Performance metrics endpoint handler
export const getPerformanceMetrics = (req, res) => {
    const activeRequests = Array.from(metrics.requests.values()).map(r => ({
        ...r,
        duration: Date.now() - r.start
    }));

    const apiStatsSummary = Array.from(metrics.apiStats.entries()).map(([endpoint, stats]) => ({
        endpoint,
        ...stats,
        errorRate: stats.count > 0 ? (stats.errors / stats.count * 100).toFixed(2) + '%' : '0%'
    }));

    res.json({
        server: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        },
        requests: {
            active: activeRequests.length,
            activeList: activeRequests
        },
        slowQueries: metrics.slowQueries.slice(-20),
        errorRates: Object.fromEntries(metrics.errorRates),
        apiStats: apiStatsSummary,
        database: {
            connected: mongoose.connection.readyState === 1,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
        }
    });
};