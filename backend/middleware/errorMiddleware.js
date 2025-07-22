const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // Don't modify the response if it's already been sent
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(e => e.message);
        message = errors.join(', ');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:');
        console.error('- Status:', statusCode);
        console.error('- Message:', message);
        console.error('- Stack:', err.stack);
        console.error('- Request:', `${req.method} ${req.originalUrl}`);
        if (req.body && Object.keys(req.body).length > 0) {
            console.error('- Body:', JSON.stringify(req.body, null, 2));
        }
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err,
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body
            }
        })
    });
};

export { notFound, errorHandler };