import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';
import ChecklistItem from '../models/ChecklistItem.js';
import Event from '../models/Event.js';
import Forum from '../models/Forum.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

/**
 * @desc    Get aggregated data for the dashboard
 * @route   GET /api/dashboard/overview
 * @access  Private
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const currentDate = new Date();

        // Using Promise.all for parallel execution
        const [
            recentBudgetEntries,
            monthlyBudget,
            checklistItems,
            upcomingEvents,
            recentForumActivity
        ] = await Promise.all([
            // Get recent budget entries
            BudgetEntry.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('type category amount description entryDate')
                .lean(),

            // Get budget summary for current month
            getBudgetSummary(userId, currentDate),

            // Get checklist progress
            ChecklistItem.find({ user: userId })
                .select('itemKey isCompleted')
                .lean(),

            // Get upcoming events (optimized query)
            Event.find({
                date: { $gte: currentDate },
                isCancelled: false,
                $or: [
                    { organizer: userId },
                    { attendees: userId }
                ]
            })
            .select('title date time location attendees organizer')
            .populate('organizer', 'name')
            .sort({ date: 1 })
            .limit(5)
            .lean(),

            // Get recent forum activity (optimized)
            getRecentForumActivity(userId, 5)
        ]);

        // Calculate checklist progress
        const completedItems = checklistItems.filter(item => item.isCompleted).length;
        const totalItems = checklistItems.length;
        const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        // Process monthly budget
        const income = monthlyBudget.find(item => item._id === 'INCOME')?.total || 0;
        const expenses = monthlyBudget.find(item => item._id === 'EXPENSE')?.total || 0;

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
                progressPercentage: Math.round(checklistProgress),
                items: checklistItems
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
            recentActivity: recentForumActivity,
            stats: {
                totalEventsAttending: upcomingEvents.length,
                eventsOrganizing: upcomingEvents.filter(e => e.organizer._id.toString() === userId.toString()).length,
                checklistCompletion: Math.round(checklistProgress),
                monthlyBalance: income - expenses
            }
        };

        // Set cache headers for client-side caching
        res.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            error: 'Failed to load dashboard data'
        });
    }
});

/**
 * @desc    Get dashboard events with pagination
 * @route   GET /api/dashboard/events
 * @access  Private
 */
export const getDashboardEvents = asyncHandler(async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    const events = [];

    try {
        // Use aggregation pipeline for better performance
        const [budgetEvents, checklistEvents] = await Promise.all([
            // Budget events
            BudgetEntry.aggregate([
                { $match: { user: req.user._id } },
                { $sort: { createdAt: -1 } },
                { $skip: parseInt(offset) },
                { $limit: parseInt(limit) },
                {
                    $project: {
                        id: { $concat: ['budget_', { $toString: '$_id' }] },
                        type: { $literal: 'BUDGET_ENTRY' },
                        title: { $concat: ['$type', ': ', '$category'] },
                        details: {
                            $concat: [
                                'Amount: €',
                                { $toString: '$amount' },
                                { $cond: [{ $ne: ['$description', ''] }, { $concat: [' - ', '$description'] }, ''] }
                            ]
                        },
                        date: { $ifNull: ['$entryDate', '$createdAt'] },
                        isCompleted: { $literal: true }
                    }
                }
            ]),

            // Checklist events
            ChecklistItem.aggregate([
                { $match: { user: req.user._id } },
                { $sort: { updatedAt: -1 } },
                { $skip: parseInt(offset) },
                { $limit: parseInt(limit) },
                {
                    $project: {
                        id: { $concat: ['checklist_', { $toString: '$_id' }] },
                        type: { $literal: 'CHECKLIST_ITEM' },
                        title: {
                            $replaceAll: {
                                input: { $toLower: '$itemKey' },
                                find: '_',
                                replacement: ' '
                            }
                        },
                        details: {
                            $concat: [
                                'Status: ',
                                { $cond: ['$isCompleted', 'Completed', 'Pending'] }
                            ]
                        },
                        date: '$updatedAt',
                        isCompleted: '$isCompleted'
                    }
                }
            ])
        ]);

        // Combine and sort events
        events.push(...budgetEvents, ...checklistEvents);
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ 
            events: events.slice(0, limit),
            hasMore: events.length > limit 
        });
    } catch (error) {
        console.error('Dashboard events error:', error);
        res.status(500).json({
            events: [],
            error: 'Failed to load dashboard events'
        });
    }
});

// Helper function to get budget summary
async function getBudgetSummary(userId, currentDate) {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return BudgetEntry.aggregate([
        {
            $match: {
                user: userId,
                entryDate: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
}

// Helper function to get recent forum activity
async function getRecentForumActivity(userId, limit) {
    // Get recent forums where user has participated
    const recentForums = await Forum.find({
        $or: [
            { user: userId },
            { 'threads.author': userId }
        ]
    })
    .select('title threads createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

    // Format the activity for dashboard
    return recentForums.map(forum => ({
        type: 'FORUM_ACTIVITY',
        forumId: forum._id,
        forumTitle: forum.title,
        recentThreads: forum.threads ? forum.threads.length : 0,
        lastActivity: forum.updatedAt || forum.createdAt
    }));
}