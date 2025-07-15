import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';

const getBudget = asyncHandler(async (req, res) => {
    const budgetEntries = await BudgetEntry.find({ user: req.user._id });
    res.status(200).json(budgetEntries);
});

const setBudget = asyncHandler(async (req, res) => {
    const { type, category, amount, description, entryDate } = req.body;
    if (!type || !category || !amount || !entryDate) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const budgetEntry = await BudgetEntry.create({
        user: req.user._id,
        type,
        category,
        amount,
        description,
        entryDate,
    });
    res.status(201).json(budgetEntry);
});

const deleteBudget = asyncHandler(async (req, res) => {
    const budgetEntry = await BudgetEntry.findById(req.params.id);
    if (!budgetEntry) {
        res.status(404);
        throw new Error('Budget entry not found');
    }
    if (budgetEntry.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }
    await budgetEntry.remove();
    res.status(200).json({ id: req.params.id });
});

export { getBudget, setBudget, deleteBudget };