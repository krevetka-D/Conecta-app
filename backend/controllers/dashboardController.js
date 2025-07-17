import asyncHandler from 'express-async-handler';
import Budget from '../models/BudgetEntry.js';
import Checklist from '../models/checklistItem.js';

/**
 * @desc    Get aggregated data for the dashboard
 * @route   GET /api/dashboard/events
 * @access  Private
 */
const getDashboardEvents = asyncHandler(async (req, res) => {
    // Fetch the user's budget
    const budget = await Budget.findOne({ user: req.user._id });

    // Fetch the user's checklist items
    const checklistItems = await Checklist.find({ user: req.user._id });

    const events = [];

    // Create a budget event if a budget exists
    if (budget) {
        events.push({
            id: `budget_${budget._id}`,
            type: 'BUDGET_OVERVIEW',
            title: 'Your Monthly Budget',
            isCompleted: budget.isCompleted, // Assuming a schema field
            date: budget.updatedAt,
            details: `Total Income: ${budget.totalIncome}, Total Expenses: ${budget.totalExpenses}`,
        });
    }

    // Transform checklist items into event objects
    checklistItems.forEach(item => {
        events.push({
            id: item._id,
            type: 'CHECKLIST_ITEM',
            title: item.task, // Assuming a 'task' field on your checklist model
            isCompleted: item.isCompleted,
            date: item.updatedAt,
            details: `Due: ${item.dueDate || 'Not set'}`, // Assuming an optional dueDate
        });
    });

    // Sort events by date, most recent first
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ events });
});

export { getDashboardEvents };