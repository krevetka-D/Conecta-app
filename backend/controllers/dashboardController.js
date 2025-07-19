
import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';
import ChecklistItem from '../models/ChecklistItem.js';
import Event from '../models/Event.js';

/**
 * @desc    Get aggregated data for the dashboard
 * @route   GET /api/dashboard/overview
 * @access  Private
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const currentDate = new Date();

        // Get recent budget entries
        const recentBudgetEntries = await BudgetEntry.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get budget summary for current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const monthlyBudget = await BudgetEntry.aggregate([
            {
                $match: {
                    user: userId,
                    entryDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const income = monthlyBudget.find(item => item._id === 'INCOME')?.total || 0;
        const expenses = monthlyBudget.find(item => item._id === 'EXPENSE')?.total || 0;

        // Get checklist progress
        const checklistItems = await ChecklistItem.find({ user: userId });
        const completedItems = checklistItems.filter(item => item.isCompleted).length;
        const totalItems = checklistItems.length;
        const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        // Get upcoming events (user is attending or organizing)
        const upcomingEvents = await Event.find({
            $and: [
                { date: { $gte: currentDate } },
                { isCancelled: false },
                {
                    $or: [
                        { organizer: userId },
                        { attendees: userId }
                    ]
                }
            ]
        })
        .populate('organizer', 'name')
        .sort({ date: 1 })
        .limit(5);

        // Get recent forum activity (if user has created forums/threads)
        // This would require Forum/Thread models to be imported

        // Compile dashboard data
        const dashboardData = {
            budget: {
                monthlyIncome: income,
                monthlyExpenses: expenses,
                balance: income - expenses,
                recentEntries: recentBudgetEntries
            },
            checklist: {
                completedItems,
                totalItems,
                progressPercentage: Math.round(checklistProgress)
            },
            upcomingEvents: upcomingEvents.map(event => ({
                _id: event._id,
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
                isOrganizer: event.organizer._id.toString() === userId.toString(),
                organizerName: event.organizer.name,
                attendeeCount: event.attendees?.length || 0
            })),
            stats: {
                totalEventsAttending: upcomingEvents.length,
                eventsOrganizing: upcomingEvents.filter(e => e.organizer._id.toString() === userId.toString()).length,
                checklistCompletion: Math.round(checklistProgress)
            }
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            error: 'Failed to load dashboard data'
        });
    }
});


export const getDashboardEvents = asyncHandler(async (req, res) => {
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