// backend/controllers/eventController.js

import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

/**
 * @desc    Get all events (with filters)
 * @route   GET /api/events
 * @access  Public
 */
export const getEvents = asyncHandler(async (req, res) => {
    const { 
        category, 
        targetAudience, 
        upcoming, 
        myEvents,
        attending,
        search 
    } = req.query;
    
    let query = { isCancelled: false };
    
    // Filter by category
    if (category) {
        query.category = category;
    }
    
    // Filter by target audience
    if (targetAudience) {
        query.targetAudience = { $in: [targetAudience, 'all', 'both'] };
    }
    
    // Filter upcoming events only
    if (upcoming === 'true') {
        query.date = { $gte: new Date() };
    }
    
    // Filter events organized by current user
    if (myEvents === 'true' && req.user) {
        query.organizer = req.user._id;
    }
    
    // Filter events user is attending
    if (attending === 'true' && req.user) {
        query.attendees = req.user._id;
    }
    
    // Search by title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [search.toLowerCase()] } }
        ];
    }
    
    const events = await Event.find(query)
        .populate('organizer', 'name email')
        .populate('attendees', 'name')
        .sort({ date: 1 });
    
    res.status(200).json(events);
});

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Public
 */
export const getEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('organizer', 'name email professionalPath')
        .populate('attendees', 'name professionalPath');
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    
    res.status(200).json(event);
});

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private
 */
export const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        date,
        time,
        location,
        maxAttendees,
        tags,
        category,
        targetAudience,
        isPublic
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !time || !location?.name) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }
    
    // Create event
    const event = await Event.create({
        title,
        description,
        date,
        time,
        location,
        organizer: req.user._id,
        attendees: [req.user._id], // Organizer automatically attends
        maxAttendees,
        tags: tags || [],
        category: category || 'meetup',
        targetAudience: targetAudience || 'all',
        isPublic: isPublic !== undefined ? isPublic : true,
    });
    
    const populatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name email')
        .populate('attendees', 'name');
    
    res.status(201).json(populatedEvent);
});

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private (organizer only)
 */
export const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the organizer can update this event');
    }
    
    // Don't allow updating past events
    if (event.isPast) {
        res.status(400);
        throw new Error('Cannot update past events');
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
    .populate('organizer', 'name email')
    .populate('attendees', 'name');
    
    res.status(200).json(updatedEvent);
});

/**
 * @desc    Join event
 * @route   POST /api/events/:id/join
 * @access  Private
 */
export const joinEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    
    // Check if event is full
    if (event.isFull) {
        res.status(400);
        throw new Error('Event is full');
    }
    
    // Check if event has passed
    if (event.isPast) {
        res.status(400);
        throw new Error('Cannot join past events');
    }
    
    // Check if user is already attending
    if (event.attendees.includes(req.user._id)) {
        res.status(400);
        throw new Error('You are already attending this event');
    }
    
    event.attendees.push(req.user._id);
    await event.save();
    
    const updatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name email')
        .populate('attendees', 'name');
    
    res.status(200).json(updatedEvent);
});

/**
 * @desc    Leave event
 * @route   POST /api/events/:id/leave
 * @access  Private
 */
export const leaveEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Organizer cannot leave their own event');
    }
    
    // Check if user is attending
    if (!event.attendees.includes(req.user._id)) {
        res.status(400);
        throw new Error('You are not attending this event');
    }
    
    event.attendees = event.attendees.filter(
        attendee => attendee.toString() !== req.user._id.toString()
    );
    await event.save();
    
    const updatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name email')
        .populate('attendees', 'name');
    
    res.status(200).json(updatedEvent);
});

/**
 * @desc    Cancel event
 * @route   DELETE /api/events/:id
 * @access  Private (organizer only)
 */
export const cancelEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the organizer can cancel this event');
    }
    
    event.isCancelled = true;
    await event.save();
    
    res.status(200).json({ message: 'Event cancelled successfully' });
});

export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the organizer can delete this event');
    }
    if (event.attendees.length > 1) {
        res.status(400);
        throw new Error('Cannot delete event with registered attendees. Cancel the event instead.');
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Event deleted successfully' });
});

