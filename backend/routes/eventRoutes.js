
import express from 'express';
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    cancelEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { eventValidationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';



const router = express.Router();

// Public routes
router.route('/')
    .get(getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(getEvent)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

// Event actions (protected routes)
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);
router.post('/:id/cancel', protect, cancelEvent);

router.post('/', 
    protect, 
    eventValidationRules.createEvent, 
    handleValidationErrors, 
    createEvent
);

export default router;