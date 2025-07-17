import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';
import ChecklistItem from '../models/ChecklistItem.js';

/**
 * @desc    Get aggregated data for the dashboard
 * @route   GET /api/dashboard/events
 * @access  Private
 */
const getDashboardEvents = asyncHandler(async (req, res) => {
    const events = [];

    try {
        // Fetch the user's budget entries
        const budgetEntries = await BudgetEntry.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Fetch the user's checklist items
        const checklistItems = await ChecklistItem.find({ user: req.user._id });

        // Transform budget entries into events
        budgetEntries.forEach(entry => {
            events.push({
                id: `budget_${entry._id}`,
                type: 'BUDGET_ENTRY',
                title: `${entry.type}: ${entry.category}`,
                details: `Amount: €${entry.amount} ${entry.description ? `- ${entry.description}` : ''}`,
                date: entry.entryDate || entry.createdAt,
                isCompleted: true,
            });
        });

        // Transform checklist items into event objects
        checklistItems.forEach(item => {
            events.push({
                id: `checklist_${item._id}`,
                type: 'CHECKLIST_ITEM',
                title: item.itemKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                details: `Status: ${item.isCompleted ? 'Completed' : 'Pending'}`,
                date: item.updatedAt,
                isCompleted: item.isCompleted,
            });
        });

        // Sort events by date, most recent first
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ events });
    } catch (error) {
        console.error('Dashboard events error:', error);
        res.status(500).json({
            events: [],
            error: 'Failed to load dashboard events'
        });
    }
});

export { getDashboardEvents };