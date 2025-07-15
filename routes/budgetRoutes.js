import express from 'express';
import { addTransaction, getTransactions, getBudgetSummary, deleteTransaction } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/summary').get(protect, getBudgetSummary);
router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').delete(protect, deleteTransaction);

export default router;