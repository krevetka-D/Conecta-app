import express from 'express';
import { getBudgetCategories, getChecklistItemsConfig, getConstants } from '../controllers/configController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', protect, getBudgetCategories);
router.get('/checklist-items', protect, getChecklistItemsConfig);
router.get('/constants', getConstants);

export default router;