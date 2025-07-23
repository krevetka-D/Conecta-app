import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'], 
        minlength: 6 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    professionalPath: { 
        type: String, 
        enum: ['FREELANCER', 'ENTREPRENEUR'],
        default: undefined // Explicitly undefined until user selects
    },
    onboardingCompleted: { 
        type: Boolean, 
        default: false 
    },
    onboardingStep: {
        type: String,
        enum: ['SELECT_PATH', 'SELECT_CHECKLIST_ITEMS', 'COMPLETED'],
        default: 'SELECT_PATH'
    },
    pinnedModules: [{ 
        type: String 
    }],
    
    // Online status tracking
    isOnline: { 
        type: Boolean, 
        default: false,
        index: true
    },
    lastSeen: { 
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    
    // Socket connection tracking
    socketIds: [{
        type: String
    }],
    
    // Profile completion
    profileCompleted: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String,
        default: 'Alicante, Spain'
    },
    
    // Notification preferences
    notificationPreferences: {
        email: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        },
        messages: {
            type: Boolean,
            default: true
        },
        events: {
            type: Boolean,
            default: true
        }
    }
}, { 
    timestamps: true 
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1});
userSchema.index({ professionalPath: 1 });
userSchema.index({ createdAt: -1 });


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { 
        next(); 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update online status
userSchema.methods.setOnlineStatus = async function(isOnline) {
    this.isOnline = isOnline;
    if (!isOnline) {
        this.lastSeen = new Date();
    }
    return this.save();
};

// Method to add socket ID
userSchema.methods.addSocketId = async function(socketId) {
    try {
        if (!this.socketIds.includes(socketId)) {
            this.socketIds.push(socketId);
            this.isOnline = true;
            return this.save({ validateModifiedOnly: true });
        }
    } catch (error) {
        // If version error, refetch and retry
        if (error.name === 'VersionError') {
            const freshUser = await this.constructor.findById(this._id);
            if (freshUser && !freshUser.socketIds.includes(socketId)) {
                freshUser.socketIds.push(socketId);
                freshUser.isOnline = true;
                return freshUser.save({ validateModifiedOnly: true });
            }
        }
        throw error;
    }
};

// Method to remove socket ID
userSchema.methods.removeSocketId = async function(socketId) {
    try {
        this.socketIds = this.socketIds.filter(id => id !== socketId);
        if (this.socketIds.length === 0) {
            this.isOnline = false;
            this.lastSeen = new Date();
        }
        // Disable version check for this operation to avoid conflicts
        return this.save({ validateModifiedOnly: true });
    } catch (error) {
        // If version error, refetch and retry
        if (error.name === 'VersionError') {
            const freshUser = await this.constructor.findById(this._id);
            if (freshUser) {
                freshUser.socketIds = freshUser.socketIds.filter(id => id !== socketId);
                if (freshUser.socketIds.length === 0) {
                    freshUser.isOnline = false;
                    freshUser.lastSeen = new Date();
                }
                return freshUser.save({ validateModifiedOnly: true });
            }
        }
        throw error;
    }
};

// Virtual for display status
userSchema.virtual('displayStatus').get(function() {
    if (this.isOnline) return 'online';
    if (this.lastSeen) {
        const diff = Date.now() - this.lastSeen.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 5) return 'recently active';
        if (minutes < 60) return `active ${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `active ${hours}h ago`;
        return 'offline';
    }
    return 'offline';
});

const User = mongoose.model('User', userSchema);
export default User;