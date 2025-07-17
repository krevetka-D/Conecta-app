// routes/checklistRoutes.js

import express from 'express';
import { getChecklist, updateChecklistItem } from '../controllers/checklistController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getChecklist);
router.route('/:itemKey').put(
    protect,
    validationRules.updateChecklist,
    handleValidationErrors,
    updateChecklistItem
);

export default router;