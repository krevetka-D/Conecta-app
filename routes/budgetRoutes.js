// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { getBudget, updateBudgetEntry } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBudget);
router.post('/entry', protect, updateBudgetEntry);

module.exports = router;