// backend/middleware/performanceMiddleware.js
import logger from '../utils/logger.js';

export const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl;

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        // Log slow requests (> 1000ms)
        if (duration > 1000) {
            logger.warn(`Slow request detected: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Add performance header
        res.setHeader('X-Response-Time', `${duration}ms`);

        // Log all requests in development
        if (process.env.NODE_ENV === 'development') {
            logger.info(`${method} ${url} - ${duration}ms - Status: ${statusCode}`);
        }

        // Call original end
        originalEnd.apply(res, args);
    };

    next();
};

// Request payload size limiter
export const payloadSizeLimiter = (maxSize = 10485760) => { // 10MB default
    return (req, res, next) => {
        let size = 0;
        
        req.on('data', (chunk) => {
            size += chunk.length;
            
            if (size > maxSize) {
                res.status(413).json({
                    error: 'Payload too large',
                    maxSize: `${maxSize / 1024 / 1024}MB`
                });
                req.connection.destroy();
            }
        });
        
        next();
    };
};