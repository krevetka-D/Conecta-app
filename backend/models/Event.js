// backend/models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    // Basic event information
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        index: 'text'
    },
    
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    
    // Event type and category
    eventType: {
        type: String,
        enum: ['in-person', 'virtual', 'hybrid'],
        default: 'in-person',
        required: true
    },
    
    category: {
        type: String,
        enum: [
            'social', 'educational', 'professional', 'sports', 
            'entertainment', 'networking', 'workshop', 'conference',
            'meetup', 'volunteer', 'cultural', 'other'
        ],
        default: 'social',
        required: true,
        index: true
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
    
    endDate: {
        type: Date,
        default: null
    },
    
    endTime: {
        type: String,
        default: null
    },
    
    timezone: {
        type: String,
        default: 'UTC'
    },
    
    // Recurring events
    isRecurring: {
        type: Boolean,
        default: false
    },
    
    recurrenceRule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: Number,
        endDate: Date,
        daysOfWeek: [Number], // 0-6 for Sunday-Saturday
        dayOfMonth: Number
    },
    
    // Location information
    location: {
        type: {
            type: String,
            enum: ['venue', 'online', 'both'],
            default: 'venue'
        },
        name: {
            type: String,
            required: true
        },
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined
            }
        },
        virtualUrl: String,
        virtualPlatform: {
            type: String,
            enum: ['zoom', 'teams', 'meet', 'webex', 'other']
        },
        instructions: String
    },
    
    // Organizer and hosts
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    coHosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Attendees and capacity
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['going', 'interested', 'not-going'],
            default: 'going'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        checkedIn: {
            type: Boolean,
            default: false
        },
        checkedInAt: Date
    }],
    
    waitlist: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    maxAttendees: {
        type: Number,
        default: null,
        min: 1
    },
    
    minAttendees: {
        type: Number,
        default: null,
        min: 1
    },
    
    // Registration settings
    registrationRequired: {
        type: Boolean,
        default: false
    },
    
    registrationDeadline: Date,
    
    registrationQuestions: [{
        question: String,
        type: {
            type: String,
            enum: ['text', 'select', 'multiselect', 'boolean'],
            default: 'text'
        },
        options: [String],
        required: Boolean
    }],
    
    // Event images and media
    coverImage: {
        url: String,
        publicId: String
    },
    
    images: [{
        url: String,
        publicId: String,
        caption: String
    }],
    
    // Tags for discoverability
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    
    // Privacy and visibility
    visibility: {
        type: String,
        enum: ['public', 'private', 'friends', 'invite-only'],
        default: 'public',
        index: true
    },
    
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Event status
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
        default: 'published',
        index: true
    },
    
    cancellationReason: String,
    postponedTo: Date,
    
    // Pricing
    isFree: {
        type: Boolean,
        default: true
    },
    
    price: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    
    // Event features
    features: {
        allowComments: {
            type: Boolean,
            default: true
        },
        allowPhotos: {
            type: Boolean,
            default: true
        },
        allowCheckins: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },
    
    // Comments
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        edited: Boolean,
        editedAt: Date,
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    
    // Analytics
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        lastViewed: Date
    },
    
    // Soft delete
    deleted: {
        type: Boolean,
        default: false,
        index: true
    },
    
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Moderation
    reported: {
        type: Boolean,
        default: false
    },
    
    reports: [{
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        description: String,
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // SEO and sharing
    slug: {
        type: String,
        unique: true,
        index: true
    },
    
    metaDescription: {
        type: String,
        maxlength: 160
    },
    
    // Custom fields for flexibility
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for geospatial queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for common queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1, date: -1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ 'attendees.user': 1 });

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
    return this.date < new Date();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
    return this.maxAttendees && this.attendees.filter(a => a.status === 'going').length >= this.maxAttendees;
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
    return this.attendees.filter(a => a.status === 'going').length;
});

// Generate slug from title
eventSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('title')) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure unique slug
        while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    
    next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcoming = async function(limit = 10, userId = null) {
    const query = {
        date: { $gte: new Date() },
        status: 'published',
        deleted: false
    };
    
    if (userId) {
        query.$or = [
            { visibility: 'public' },
            { organizer: userId },
            { 'attendees.user': userId },
            { invitedUsers: userId }
        ];
    } else {
        query.visibility = 'public';
    }
    
    return await this.find(query)
        .sort({ date: 1 })
        .limit(limit)
        .populate('organizer', 'name avatar')
        .populate('attendees.user', 'name avatar');
};

// Static method to get events near a location
eventSchema.statics.getNearby = async function(longitude, latitude, maxDistance = 10000) {
    return await this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance // in meters
            }
        },
        date: { $gte: new Date() },
        status: 'published',
        deleted: false,
        visibility: 'public'
    })
    .limit(20)
    .populate('organizer', 'name avatar');
};

// Instance method to add attendee
eventSchema.methods.addAttendee = async function(userId, status = 'going') {
    const existingAttendee = this.attendees.find(a => a.user.toString() === userId.toString());
    
    if (existingAttendee) {
        existingAttendee.status = status;
    } else {
        // Check if event is full
        if (this.isFull && status === 'going') {
            // Add to waitlist
            if (!this.waitlist.find(w => w.user.toString() === userId.toString())) {
                this.waitlist.push({ user: userId });
            }
            throw new Error('Event is full. Added to waitlist.');
        }
        
        this.attendees.push({
            user: userId,
            status: status
        });
    }
    
    return await this.save();
};

// Instance method to remove attendee
eventSchema.methods.removeAttendee = async function(userId) {
    this.attendees = this.attendees.filter(a => a.user.toString() !== userId.toString());
    
    // Check waitlist and promote first person
    if (this.waitlist.length > 0 && !this.isFull) {
        const nextAttendee = this.waitlist.shift();
        this.attendees.push({
            user: nextAttendee.user,
            status: 'going'
        });
    }
    
    return await this.save();
};

// Instance method for check-in
eventSchema.methods.checkInAttendee = async function(userId) {
    const attendee = this.attendees.find(a => a.user.toString() === userId.toString());
    
    if (!attendee) {
        throw new Error('User is not registered for this event');
    }
    
    if (attendee.checkedIn) {
        throw new Error('User already checked in');
    }
    
    attendee.checkedIn = true;
    attendee.checkedInAt = new Date();
    
    return await this.save();
};

// Soft delete method
eventSchema.methods.softDelete = async function(deletedBy) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.status = 'cancelled';
    
    return await this.save();
};

// Get event statistics
eventSchema.methods.getStats = function() {
    const goingCount = this.attendees.filter(a => a.status === 'going').length;
    const interestedCount = this.attendees.filter(a => a.status === 'interested').length;
    const checkedInCount = this.attendees.filter(a => a.checkedIn).length;
    
    return {
        going: goingCount,
        interested: interestedCount,
        notGoing: this.attendees.filter(a => a.status === 'not-going').length,
        checkedIn: checkedInCount,
        waitlist: this.waitlist.length,
        capacity: this.maxAttendees || 'Unlimited',
        availableSpots: this.maxAttendees ? Math.max(0, this.maxAttendees - goingCount) : 'Unlimited'
    };
};

// Create model
const Event = mongoose.model('Event', eventSchema);

export default Event;