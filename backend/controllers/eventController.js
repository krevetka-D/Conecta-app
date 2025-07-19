
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
        search,
        limit = 20,
        skip = 0
    } = req.query;
    
    // Build query
    let query = { isCancelled: false };
    
    // Filter by category
    if (category && category !== 'all') {
        query.category = category;
    }
    
    // Filter by target audience
    if (targetAudience && targetAudience !== 'all') {
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
    
    // Search by title, description, or tags
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [search.toLowerCase()] } }
        ];
    }
    
    try {
        const events = await Event.find(query)
            .populate('organizer', 'name email professionalPath')
            .populate('attendees', 'name')
            .sort({ date: 1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .lean();
        
        // Get total count for pagination
        const total = await Event.countDocuments(query);
        
        res.status(200).json({
            events,
            pagination: {
                total,
                limit: Number(limit),
                skip: Number(skip),
                hasMore: skip + events.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500);
        throw new Error('Failed to fetch events');
    }
});

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Public
 */
export const getEvent = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email professionalPath')
            .populate('attendees', 'name professionalPath');
        
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        
        res.status(200).json(event);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        throw error;
    }
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
    
    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
        res.status(400);
        throw new Error('Event date must be in the future');
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        res.status(400);
        throw new Error('Invalid time format. Use HH:MM format');
    }
    
    try {
        // Create event
        const eventData = {
            title: title.trim(),
            description: description.trim(),
            date: eventDate,
            time,
            location: {
                name: location.name.trim(),
                address: location.address?.trim() || '',
                city: location.city?.trim() || 'Alicante'
            },
            organizer: req.user._id,
            attendees: [req.user._id], // Organizer automatically attends
            maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
            tags: tags?.map(tag => tag.toLowerCase().trim()).filter(Boolean) || [],
            category: category || 'meetup',
            targetAudience: targetAudience || 'all',
            isPublic: isPublic !== undefined ? isPublic : true,
        };
        
        const event = await Event.create(eventData);
        
        const populatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name');
        
        res.status(201).json(populatedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500);
        throw new Error('Failed to create event');
    }
});

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private (organizer only)
 */
export const updateEvent = asyncHandler(async (req, res) => {
    try {
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
        
        // Validate new date if provided
        if (req.body.date) {
            const newDate = new Date(req.body.date);
            if (newDate < new Date()) {
                res.status(400);
                throw new Error('Event date must be in the future');
            }
        }
        
        // Update allowed fields
        const allowedUpdates = [
            'title', 'description', 'date', 'time', 
            'location', 'maxAttendees', 'tags', 
            'category', 'targetAudience', 'isPublic'
        ];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });
        
        await event.save();
        
        const updatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name');
        
        res.status(200).json(updatedEvent);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        throw error;
    }
});

/**
 * @desc    Join event
 * @route   POST /api/events/:id/join
 * @access  Private
 */
export const joinEvent = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        
        // Use the model method to add attendee
        await event.addAttendee(req.user._id);
        
        const updatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name');
        
        res.status(200).json(updatedEvent);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        res.status(400);
        throw new Error(error.message);
    }
});

/**
 * @desc    Leave event
 * @route   POST /api/events/:id/leave
 * @access  Private
 */
export const leaveEvent = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        
        // Use the model method to remove attendee
        await event.removeAttendee(req.user._id);
        
        const updatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name');
        
        res.status(200).json(updatedEvent);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        res.status(400);
        throw new Error(error.message);
    }
});

/**
 * @desc    Cancel event (soft delete)
 * @route   POST /api/events/:id/cancel
 * @access  Private (organizer only)
 */
export const cancelEvent = asyncHandler(async (req, res) => {
    try {
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
        
        res.status(200).json({ 
            message: 'Event cancelled successfully',
            event: event
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        throw error;
    }
});

/**
 * @desc    Delete event (hard delete)
 * @route   DELETE /api/events/:id
 * @access  Private (organizer only)
 */
export const deleteEvent = asyncHandler(async (req, res) => {
    try {
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
        
        // Only allow deletion if no other attendees
        if (event.attendees.length > 1) {
            res.status(400);
            throw new Error('Cannot delete event with registered attendees. Cancel the event instead.');
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({ 
            message: 'Event deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Event not found');
        }
        throw error;
    }
});