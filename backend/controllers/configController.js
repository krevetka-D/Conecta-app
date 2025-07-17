// backend/controllers/configController.js
import asyncHandler from 'express-async-handler';
import { BUDGET_CATEGORIES, CHECKLIST_ITEMS, PROFESSIONAL_PATHS } from '../config/constants.js';

/**
 * @desc    Get budget categories based on user's professional path
 * @route   GET /api/config/categories
 * @access  Private
 */
export const getBudgetCategories = asyncHandler(async (req, res) => {
    const { professionalPath } = req.user;

    if (!professionalPath) {
        res.status(400);
        throw new Error('User professional path not set');
    }

    const categories = BUDGET_CATEGORIES[professionalPath];

    if (!categories) {
        res.status(404);
        throw new Error('Categories not found for professional path');
    }

    res.status(200).json({
        income: categories.INCOME,
        expense: categories.EXPENSE
    });
});

/**
 * @desc    Get checklist items based on user's professional path
 * @route   GET /api/config/checklist-items
 * @access  Private
 */
export const getChecklistItemsConfig = asyncHandler(async (req, res) => {
    const { professionalPath } = req.user;

    if (!professionalPath) {
        res.status(400);
        throw new Error('User professional path not set');
    }

    const items = CHECKLIST_ITEMS[professionalPath];

    if (!items) {
        res.status(404);
        throw new Error('Checklist items not found for professional path');
    }

    res.status(200).json(items);
});

/**
 * @desc    Get all configuration constants
 * @route   GET /api/config/constants
 * @access  Public
 */
export const getConstants = asyncHandler(async (req, res) => {
    res.status(200).json({
        professionalPaths: PROFESSIONAL_PATHS,
        // Don't send all categories and checklist items to public endpoint
    });
});