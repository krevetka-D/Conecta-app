// backend/routes/budgetRoutes.js
import express from 'express';
import {
    getBudget,
    setBudget,
    updateBudget,
    deleteBudget,
    getBudgetSummary
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Get all budget entries with optional caching
router.get('/',
    protect,
    cacheMiddleware(300), // Cache for 5 minutes
    getBudget
);

// Create new budget entry
router.post('/',
    protect,
    validationRules.createBudget,
    handleValidationErrors,
    setBudget
);

// Get budget summary
router.get('/summary',
    protect,
    cacheMiddleware(600), // Cache for 10 minutes
    getBudgetSummary
);

// Update specific budget entry
router.put('/:id',
    protect,
    validationRules.mongoId,
    validationRules.createBudget,
    handleValidationErrors,
    updateBudget
);

// Delete specific budget entry
router.delete('/:id',
    protect,
    validationRules.mongoId,
    handleValidationErrors,
    deleteBudget
);

export default router;