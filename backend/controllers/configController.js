import asyncHandler from 'express-async-handler';
// The path has been corrected from ../../ to ../
import { BUDGET_CATEGORIES, CHECKLIST_ITEMS, PROFESSIONAL_PATHS } from '../config/constants.js';

/**
 * @desc    Get budget categories based on user's professional path
 * @route   GET /api/config/categories
 * @access  Private
 */
export const getBudgetCategories = asyncHandler(async (req, res) => {
    // Check for professionalPath in the query first, then fall back to the user object.
    let path = req.query.professionalPath || req.user?.professionalPath;

    // If no path is provided and user doesn't have one, provide a default
    if (!path) {
        // Default to FREELANCER if no path is specified
        path = 'FREELANCER';
        console.log('No professional path provided, defaulting to FREELANCER');
    }

    // Convert to uppercase to ensure consistent matching with keys
    const professionalPath = path.toUpperCase();

    const categories = BUDGET_CATEGORIES[professionalPath];

    if (!categories) {
        // If invalid path, return default FREELANCER categories
        console.log(`Invalid professional path: ${professionalPath}, returning FREELANCER categories`);
        const defaultCategories = BUDGET_CATEGORIES.FREELANCER;

        res.status(200).json({
            income: defaultCategories.INCOME || [],
            expense: defaultCategories.EXPENSE || [],
            professionalPath: 'FREELANCER' // Include the path used
        });
        return;
    }

    res.status(200).json({
        income: categories.INCOME || [],
        expense: categories.EXPENSE || [],
        professionalPath: professionalPath // Include the path used
    });
});

/**
 * @desc    Get checklist items based on user's professional path
 * @route   GET /api/config/checklist-items
 * @access  Private
 */
export const getChecklistItemsConfig = asyncHandler(async (req, res) => {
    const { professionalPath } = req.user || {};

    if (!professionalPath) {
        // Return default FREELANCER items if no path is set
        const defaultItems = CHECKLIST_ITEMS.FREELANCER;
        res.status(200).json(defaultItems);
        return;
    }

    const items = CHECKLIST_ITEMS[professionalPath];

    if (!items) {
        // Return default FREELANCER items if invalid path
        const defaultItems = CHECKLIST_ITEMS.FREELANCER;
        res.status(200).json(defaultItems);
        return;
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