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