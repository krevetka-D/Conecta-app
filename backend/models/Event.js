// backend/models/Event.js

import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    maxAttendees: {
        type: Number,
        default: null, // null means unlimited
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true,
    }],
    category: {
        type: String,
        enum: ['networking', 'workshop', 'social', 'meetup', 'conference', 'other'],
        default: 'meetup',
    },
    targetAudience: {
        type: String,
        enum: ['all', 'freelancers', 'entrepreneurs', 'both'],
        default: 'all',
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    isCancelled: {
        type: Boolean,
        default: false,
    },
    coverImage: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
    return this.maxAttendees && this.attendees.length >= this.maxAttendees;
});

// Virtual for checking if event has passed
eventSchema.virtual('isPast').get(function() {
    return this.date < new Date();
});

// Add index for efficient querying
eventSchema.index({ date: 1, category: 1, targetAudience: 1 });
eventSchema.index({ 'tags': 1 });
eventSchema.index({ organizer: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;