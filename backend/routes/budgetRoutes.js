
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

// Get all budget entries - no caching for real-time data
router.get('/',
    protect,
    getBudget
);

// Create new budget entry
router.post('/',
    protect,
    validationRules.createBudget,
    handleValidationErrors,
    setBudget
);

// Get budget summary - no caching for real-time data
router.get('/summary',
    protect,
    getBudgetSummary
);

// Update specific budget entry
router.put('/:id',
    protect,
    validationRules.mongoId,
    validationRules.updateBudget,
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