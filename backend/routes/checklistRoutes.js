// routes/checklistRoutes.js

import express from 'express';
import { getChecklist, updateChecklistItem } from '../controllers/checklistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getChecklist);
router.route('/:itemKey').put(protect, updateChecklistItem);

export default router;