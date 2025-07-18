import { body, param, query, validationResult } from 'express-validator';

// Common validation rules
export const validationRules = {
    // User validation
    register: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Must be a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],

    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Must be a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required'),
    ],

    // Budget validation
    createBudget: [
        body('type')
            .notEmpty().withMessage('Type is required')
            .isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
        body('category')
            .trim()
            .notEmpty().withMessage('Category is required'),
        body('amount')
            .notEmpty().withMessage('Amount is required')
            .isNumeric().withMessage('Amount must be a number')
            .custom(value => value > 0).withMessage('Amount must be positive'),
        body('entryDate')
            .notEmpty().withMessage('Entry date is required')
            .isISO8601().withMessage('Must be a valid date'),
    ],

    // Checklist validation
    updateChecklist: [
        param('itemKey')
            .notEmpty().withMessage('Item key is required')
            .matches(/^[A-Z_]+$/).withMessage('Invalid item key format'),
        body('isCompleted')
            .notEmpty().withMessage('Completion status is required')
            .isBoolean().withMessage('Must be a boolean value'),
    ],

    // ID validation
    mongoId: [
        param('id').isMongoId().withMessage('Invalid ID format'),
    ],
};

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }

    next();
};
// backend/middleware/validationMiddleware.js - Add these to your existing file

// Event validation rules
export const eventValidationRules = {
    createEvent: [
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
        body('description')
            .trim()
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
        body('date')
            .notEmpty().withMessage('Date is required')
            .isISO8601().withMessage('Invalid date format')
            .custom(value => new Date(value) > new Date()).withMessage('Event date must be in the future'),
        body('time')
            .notEmpty().withMessage('Time is required')
            .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
        body('location.name')
            .trim()
            .notEmpty().withMessage('Location name is required'),
        body('maxAttendees')
            .optional()
            .isInt({ min: 1 }).withMessage('Max attendees must be a positive number'),
        body('category')
            .optional()
            .isIn(['networking', 'workshop', 'social', 'meetup', 'conference', 'other'])
            .withMessage('Invalid category'),
        body('targetAudience')
            .optional()
            .isIn(['all', 'freelancers', 'entrepreneurs', 'both'])
            .withMessage('Invalid target audience'),
    ],

    updateEvent: [
        param('id').isMongoId().withMessage('Invalid event ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
        body('date')
            .optional()
            .isISO8601().withMessage('Invalid date format')
            .custom(value => new Date(value) > new Date()).withMessage('Event date must be in the future'),
        body('time')
            .optional()
            .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
    ],
};

// Forum validation rules  
export const forumValidationRules = {
    createForum: [
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
        body('description')
            .trim()
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    ],

    createThread: [
        param('id').isMongoId().withMessage('Invalid forum ID'),
        body('title')
            .trim()
            .notEmpty().withMessage('Thread title is required')
            .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
        body('content')
            .trim()
            .notEmpty().withMessage('Content is required')
            .isLength({ min: 5, max: 10000 }).withMessage('Content must be between 5 and 10000 characters'),
    ],

    createPost: [
        param('threadId').isMongoId().withMessage('Invalid thread ID'),
        body('content')
            .trim()
            .notEmpty().withMessage('Content is required')
            .isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters'),
    ],
};