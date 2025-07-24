import asyncHandler from 'express-async-handler';
import BudgetEntry from '../models/BudgetEntry.js';
import { clearCache } from '../middleware/cacheMiddleware.js';
import { emitBudgetDelete } from '../socket/realtimeEvents.js';

/**
 * @desc    Delete budget entry with race condition protection
 * @route   DELETE /api/budget/:id
 * @access  Private
 */
export const deleteBudgetImproved = asyncHandler(async (req, res) => {
    const entryId = req.params.id;
    const userId = req.user._id;

    try {
        // Use atomic findOneAndDelete to prevent race conditions
        const deletedEntry = await BudgetEntry.findOneAndDelete({
            _id: entryId,
            user: userId // Include ownership check in the query
        });

        if (!deletedEntry) {
            // Check if entry exists but user doesn't own it
            const exists = await BudgetEntry.exists({ _id: entryId });
            
            if (exists) {
                // Entry exists but user doesn't own it
                res.status(403);
                throw new Error('Not authorized to delete this entry');
            } else {
                // Entry doesn't exist - could be already deleted
                // Return success for idempotency
                console.log(`Budget entry ${entryId} not found - may have been already deleted`);
                
                // Still clear cache and emit delete event for consistency
                clearCache(`budget_${userId}`);
                emitBudgetDelete(userId, entryId);
                
                return res.status(200).json({
                    message: 'Budget entry deleted successfully',
                    id: entryId,
                    alreadyDeleted: true
                });
            }
        }

        // Successfully deleted - clear cache and emit event
        clearCache(`budget_${userId}`);
        emitBudgetDelete(userId, entryId);

        res.status(200).json({
            message: 'Budget entry deleted successfully',
            id: entryId,
            deletedEntry: {
                type: deletedEntry.type,
                category: deletedEntry.category,
                amount: deletedEntry.amount,
                entryDate: deletedEntry.entryDate
            }
        });
    } catch (error) {
        // Log error for debugging
        console.error(`Error deleting budget entry ${entryId}:`, error);
        throw error;
    }
});

/**
 * Alternative implementation with request deduplication using in-memory cache
 * This prevents multiple simultaneous deletion requests
 */
const deletionInProgress = new Map();

export const deleteBudgetWithDeduplication = asyncHandler(async (req, res) => {
    const entryId = req.params.id;
    const userId = req.user._id;
    const requestKey = `${userId}_${entryId}`;

    // Check if deletion is already in progress
    if (deletionInProgress.has(requestKey)) {
        console.log(`Deletion already in progress for ${entryId}`);
        
        // Wait for the ongoing deletion to complete
        try {
            const result = await deletionInProgress.get(requestKey);
            return res.status(200).json(result);
        } catch (error) {
            throw error;
        }
    }

    // Create a promise for this deletion operation
    const deletionPromise = (async () => {
        try {
            const deletedEntry = await BudgetEntry.findOneAndDelete({
                _id: entryId,
                user: userId
            });

            if (!deletedEntry) {
                const exists = await BudgetEntry.exists({ _id: entryId });
                
                if (exists) {
                    const error = new Error('Not authorized to delete this entry');
                    error.statusCode = 403;
                    throw error;
                } else {
                    // Idempotent response for already deleted entries
                    return {
                        message: 'Budget entry deleted successfully',
                        id: entryId,
                        alreadyDeleted: true
                    };
                }
            }

            // Clear cache and emit event
            clearCache(`budget_${userId}`);
            emitBudgetDelete(userId, entryId);

            return {
                message: 'Budget entry deleted successfully',
                id: entryId,
                deletedEntry: {
                    type: deletedEntry.type,
                    category: deletedEntry.category,
                    amount: deletedEntry.amount,
                    entryDate: deletedEntry.entryDate
                }
            };
        } finally {
            // Clean up the deduplication cache after a short delay
            setTimeout(() => {
                deletionInProgress.delete(requestKey);
            }, 1000);
        }
    })();

    // Store the promise for deduplication
    deletionInProgress.set(requestKey, deletionPromise);

    try {
        const result = await deletionPromise;
        res.status(200).json(result);
    } catch (error) {
        if (error.statusCode === 403) {
            res.status(403);
        } else {
            res.status(404);
        }
        throw error;
    }
});

export default {
    deleteBudgetImproved,
    deleteBudgetWithDeduplication
};