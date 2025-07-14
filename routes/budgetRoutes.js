const express = require('express');
const router = express.Router();
const {
    getAllBudgets, // Correctly import 'getAllBudgets' instead of 'getBudgets'
    createBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// Use router.route() to chain methods for the same endpoint
router.route('/')
    .get(protect, getAllBudgets)
    .post(protect, createBudget);

module.exports = router;
