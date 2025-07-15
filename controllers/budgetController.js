import asyncHandler from 'express-async-handler';
import Transaction from '../models/Budget.js';

const addTransaction = asyncHandler(async (req, res) => {
    const { type, category, amount, description } = req.body;
    if (!type || !category || !amount) {
        res.status(400);
        throw new Error('Please provide a type, category, and amount');
    }
    const transaction = await Transaction.create({ user: req.user._id, type, category, amount, description });
    res.status(201).json(transaction);
});

const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id });
    res.json(transactions);
});

const getBudgetSummary = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id });
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, item) => acc + item.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
    const balance = totalIncome - totalExpenses;
    res.json({ totalIncome, totalExpenses, balance });
});

const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction && transaction.user.toString() === req.user._id.toString()) {
        await transaction.deleteOne();
        res.json({ message: 'Transaction removed' });
    } else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});

export { addTransaction, getTransactions, getBudgetSummary, deleteTransaction };