
import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware.js';
import { emitBudgetCreate, emitBudgetUpdate, emitBudgetDelete } from '../socket/realtimeEvents.js';

/**
 * @desc    Get user's budget entries
 * @route   GET /api/budget
 * @access  Private
 */
export const getBudget = asyncHandler(async (req, res) => {
    const {
        type,
        category,
        startDate,
        endDate,
        limit = 50,
        skip = 0,
        sortBy = 'entryDate',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (type) {
        query.type = type.toUpperCase();
    }

    if (category) {
        query.category = new RegExp(category, 'i');
    }

    if (startDate || endDate) {
        query.entryDate = {};
        if (startDate) query.entryDate.$gte = new Date(startDate);
        if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    // Execute query with pagination and sorting
    const budgetEntries = await BudgetEntry.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(Number(limit))
        .skip(Number(skip))
        .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalCount = await BudgetEntry.countDocuments(query);

    // Calculate summary
    const summary = await BudgetEntry.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    const income = summary.find(s => s._id === 'INCOME')?.total || 0;
    const expenses = summary.find(s => s._id === 'EXPENSE')?.total || 0;

    res.status(200).json({
        entries: budgetEntries,
        pagination: {
            total: totalCount,
            page: Math.floor(skip / limit) + 1,
            pages: Math.ceil(totalCount / limit),
            hasNext: skip + limit < totalCount,
            hasPrev: skip > 0
        },
        summary: {
            income,
            expenses,
            balance: income - expenses,
            incomeCount: summary.find(s => s._id === 'INCOME')?.count || 0,
            expenseCount: summary.find(s => s._id === 'EXPENSE')?.count || 0
        }
    });
});

/**
 * @desc    Create new budget entry
 * @route   POST /api/budget
 * @access  Private
 */
export const setBudget = asyncHandler(async (req, res) => {
    const { type, category, amount, description, entryDate } = req.body;

    // Validation
    if (!type || !category || !amount || !entryDate) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    if (!['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
        res.status(400);
        throw new Error('Type must be INCOME or EXPENSE');
    }

    if (amount <= 0) {
        res.status(400);
        throw new Error('Amount must be positive');
    }

    // Validate date
    const date = new Date(entryDate);
    if (isNaN(date.getTime())) {
        res.status(400);
        throw new Error('Invalid date format');
    }

    const budgetEntry = await BudgetEntry.create({
        user: req.user._id,
        type: type.toUpperCase(),
        category: category.trim(),
        amount: Number(amount),
        description: description?.trim() || '',
        entryDate: date,
    });

    // Clear cache for this user's budget data
    clearCache(`budget_${req.user._id}`);
    
    // Emit real-time update
    emitBudgetCreate(req.user._id, budgetEntry);

    res.status(201).json(budgetEntry);
});

/**
 * @desc    Update budget entry
 * @route   PUT /api/budget/:id
 * @access  Private
 */
export const updateBudget = asyncHandler(async (req, res) => {
    const budgetEntry = await BudgetEntry.findById(req.params.id);

    if (!budgetEntry) {
        res.status(404);
        throw new Error('Budget entry not found');
    }

    // Check ownership
    if (budgetEntry.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this entry');
    }

    // Validate update data
    if (req.body.type && !['INCOME', 'EXPENSE'].includes(req.body.type.toUpperCase())) {
        res.status(400);
        throw new Error('Type must be INCOME or EXPENSE');
    }

    if (req.body.amount !== undefined && req.body.amount <= 0) {
        res.status(400);
        throw new Error('Amount must be positive');
    }

    // Update entry
    const updatedEntry = await BudgetEntry.findByIdAndUpdate(
        req.params.id,
        {
            ...req.body,
            type: req.body.type?.toUpperCase(),
            category: req.body.category?.trim(),
        },
        {
            new: true,
            runValidators: true,
        }
    );

    // Clear cache
    clearCache(`budget_${req.user._id}`);
    
    // Emit real-time update
    emitBudgetUpdate(req.user._id, updatedEntry);

    res.status(200).json(updatedEntry);
});

/**
 * @desc    Delete budget entry
 * @route   DELETE /api/budget/:id
 * @access  Private
 */
export const deleteBudget = asyncHandler(async (req, res) => {
    const budgetEntry = await BudgetEntry.findById(req.params.id);

    if (!budgetEntry) {
        res.status(404);
        throw new Error('Budget entry not found');
    }

    // Check ownership
    if (budgetEntry.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this entry');
    }

    await BudgetEntry.findByIdAndDelete(req.params.id);

    // Clear cache
    clearCache(`budget_${req.user._id}`);
    
    // Emit real-time update
    emitBudgetDelete(req.user._id, req.params.id);

    res.status(200).json({
        message: 'Budget entry deleted successfully',
        id: req.params.id
    });
});

/**
 * @desc    Get budget summary
 * @route   GET /api/budget/summary
 * @access  Private
 */
export const getBudgetSummary = asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'week':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            dateFilter = { entryDate: { $gte: weekStart } };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { entryDate: { $gte: monthStart } };
            break;
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            dateFilter = { entryDate: { $gte: yearStart } };
            break;
        default:
            break;
    }

    const summary = await BudgetEntry.aggregate([
        {
            $match: {
                user: req.user._id,
                ...dateFilter
            }
        },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                entries: { $sum: 1 },
                categories: { $addToSet: '$category' }
            }
        }
    ]);

    const income = summary.find(s => s._id === 'INCOME') || { total: 0, entries: 0, categories: [] };
    const expenses = summary.find(s => s._id === 'EXPENSE') || { total: 0, entries: 0, categories: [] };

    res.status(200).json({
        period,
        income: {
            total: income.total,
            entries: income.entries,
            categories: income.categories
        },
        expenses: {
            total: expenses.total,
            entries: expenses.entries,
            categories: expenses.categories
        },
        balance: income.total - expenses.total,
        savingsRate: income.total > 0 ? ((income.total - expenses.total) / income.total * 100).toFixed(2) : 0
    });
});
