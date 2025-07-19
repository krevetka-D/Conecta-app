// backend/models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    // Basic event information
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    
    // Event type and category
    category: {
        type: String,
        enum: ['networking', 'workshop', 'social', 'meetup', 'conference', 'other'],
        default: 'meetup',
        required: true
    },
    
    targetAudience: {
        type: String,
        enum: ['all', 'freelancers', 'entrepreneurs', 'both'],
        default: 'all'
    },
    
    // Date and time
    date: {
        type: Date,
        required: true,
        index: true
    },
    
    time: {
        type: String,
        required: true
    },
    
    // Location information
    location: {
        name: {
            type: String,
            required: true
        },
        address: String,
        city: {
            type: String,
            default: 'Alicante'
        }
    },
    
    // Organizer and attendees
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    maxAttendees: {
        type: Number,
        default: null,
        min: 1
    },
    
    // Tags for discoverability
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    
    // Event status
    isPublic: {
        type: Boolean,
        default: true
    },
    
    isCancelled: {
        type: Boolean,
        default: false
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for common queries
eventSchema.index({ date: 1, isCancelled: 1 });
eventSchema.index({ organizer: 1, date: -1 });
eventSchema.index({ 'attendees': 1 });

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
    return this.date < new Date();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
    return this.maxAttendees && this.attendees.length >= this.maxAttendees;
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
    return this.attendees.length;
});

// Pre-save validation
eventSchema.pre('save', function(next) {
    // Ensure date is in the future for new events
    if (this.isNew && this.date < new Date()) {
        return next(new Error('Event date must be in the future'));
    }
    
    // Ensure organizer is also in attendees
    if (this.isNew && !this.attendees.includes(this.organizer)) {
        this.attendees.push(this.organizer);
    }
    
    next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcoming = async function(limit = 10) {
    return await this.find({
        date: { $gte: new Date() },
        isCancelled: false,
        isPublic: true
    })
    .sort({ date: 1 })
    .limit(limit)
    .populate('organizer', 'name email')
    .populate('attendees', 'name');
};

// Instance method to add attendee
eventSchema.methods.addAttendee = async function(userId) {
    // Check if already attending
    if (this.attendees.some(id => id.toString() === userId.toString())) {
        throw new Error('Already attending this event');
    }
    
    // Check if event is full
    if (this.isFull) {
        throw new Error('Event is full');
    }
    
    // Check if event is past
    if (this.isPast) {
        throw new Error('Cannot join past events');
    }
    
    this.attendees.push(userId);
    return await this.save();
};

// Instance method to remove attendee
eventSchema.methods.removeAttendee = async function(userId) {
    // Don't allow organizer to leave
    if (this.organizer.toString() === userId.toString()) {
        throw new Error('Organizer cannot leave their own event');
    }
    
    this.attendees = this.attendees.filter(
        id => id.toString() !== userId.toString()
    );
    
    return await this.save();
};


const Event = mongoose.model('Event', eventSchema);

export default Event;