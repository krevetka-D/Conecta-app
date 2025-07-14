const Budget = require('../models/Budget');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
const getAllBudgets = async (req, res) => {
    try {
        // Add await to ensure the query executes
        const budgets = await Budget.find({ user: req.user._id });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
    const { category, amount } = req.body;

    try {
        const budget = new Budget({
            user: req.user._id,
            category,
            amount,
        });

        const createdBudget = await budget.save();
        res.status(201).json(createdBudget);
    } catch (error) {
        res.status(400).json({ message: 'Invalid budget data' });
    }
};

module.exports = {
    getAllBudgets,
    createBudget,
};