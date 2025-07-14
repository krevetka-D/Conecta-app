// controllers/budgetController.js
const Budget = require('../models/Budget');
const User = require('../models/User');

// @desc    Get the correct budget for the user
// @route   GET /api/budget
const getBudget = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let budgetType;
        let defaultCategories = [];

        if (user.path === 'International Student') {
            const flatTaskCompleted = user.completedPriorities.includes("Find a flat or student room");
            budgetType = !flatTaskCompleted ? 'setup_deposit' : 'monthly_student';
            defaultCategories = !flatTaskCompleted
                ? ["Temporary Housing", "Rental Deposit", "First Month's Rent", "University Fees", "TIE Application Fee", "Flights"]
                : ["Rent", "Groceries", "Utilities", "Transport", "Phone Bill", "Entertainments", "Personal Savings"];
        } else if (user.path === 'Immigrant looking for a job') {
            budgetType = 'monthly_employee';
            defaultCategories = ["Salary (Net Income)", "Rent/Mortgage", "Utilities", "Transport", "Groceries", "Debt Repayment", "Long-Term Savings"];
        } else {
            return res.status(400).json({ message: 'User path not set. Please complete onboarding.' });
        }

        let budget = await Budget.findOne({ user: req.user.id, type: budgetType });

        if (!budget) {
            const initialEntries = defaultCategories.map(category => ({ category, amount: 0, description: '' }));
            budget = await Budget.create({ user: req.user.id, type: budgetType, entries: initialEntries });
        }

        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add or update a budget entry
// @route   POST /api/budget/entry
const updateBudgetEntry = async (req, res) => {
    try {
        const { budgetId, category, amount, description } = req.body;
        const budget = await Budget.findById(budgetId);

        if (budget && budget.user.toString() === req.user.id) {
            const entryIndex = budget.entries.findIndex(entry => entry.category === category);

            if (entryIndex > -1) {
                // Update existing entry
                budget.entries[entryIndex].amount = amount;
                budget.entries[entryIndex].description = description || '';
            } else {
                // Add new entry
                budget.entries.push({ category, amount, description });
            }

            const updatedBudget = await budget.save();
            res.json(updatedBudget);
        } else {
            res.status(404).json({ message: 'Budget not found or not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// This line makes the functions available to other files
module.exports = { getBudget, updateBudgetEntry };