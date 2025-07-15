import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: [true, 'Please add a name'] },
    email: { type: String, required: [true, 'Please add an email'], unique: true },
    password: { type: String, required: [true, 'Please add a password'], minlength: 6 },

    role: {
        type: String,
        enum: ['user', 'admin'], // Restricts the role to one of these two values
        default: 'user'          // Ensures all new users are regular users by default
    },

    professionalPath: { type: String, enum: ['FREELANCER', 'ENTREPRENEUR'] },
    onboardingCompleted: { type: Boolean, default: false },
    pinnedModules: [{ type: String }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { next(); }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;