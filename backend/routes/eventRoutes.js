// backend/routes/eventRoutes.js
import express from 'express';
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.route('/')
    .get(getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(getEvent)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

// Event actions
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

export default router;