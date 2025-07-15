// routes/budgetRoutes.js

import express from 'express';
import { getBudget, setBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getBudget).post(protect, setBudget);
router.route('/:id').delete(protect, deleteBudget);

export default router;