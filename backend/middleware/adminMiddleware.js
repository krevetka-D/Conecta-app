import asyncHandler from 'express-async-handler';

/**
 * @desc Middleware to check if the user is an administrator.
 * This should be used AFTER the 'protect' middleware.
 */
const admin = (req, res, next) => {
    // The 'protect' middleware should have already run and attached the user object to the request.
    if (req.user && req.user.role === 'admin') {
        // If the user exists and their role is 'admin', proceed to the next middleware or controller.
        next();
    } else {
        // If not, send a '403 Forbidden' error. This is more specific than '401 Unauthorized'.
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

export { admin };