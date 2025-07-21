import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { createChecklistForUser } from './checklistController.js';

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
            onboardingStep: user.onboardingStep,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc Register a new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, professionalPath } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        professionalPath: professionalPath || undefined,
        onboardingStep: professionalPath ? 'SELECT_CHECKLIST_ITEMS' : 'SELECT_PATH',
        onboardingCompleted: false,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
            onboardingStep: user.onboardingStep,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc Get user profile
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
            onboardingStep: user.onboardingStep,
            pinnedModules: user.pinnedModules,
            bio: user.bio,
            location: user.location,
            profileCompleted: user.profileCompleted,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Update user professional path
// @route PUT /api/users/professional-path
// @access Private
const updateProfessionalPath = asyncHandler(async (req, res) => {
    const { professionalPath } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!['FREELANCER', 'ENTREPRENEUR'].includes(professionalPath)) {
        res.status(400);
        throw new Error('Invalid professional path');
    }

    user.professionalPath = professionalPath;
    user.onboardingStep = 'SELECT_CHECKLIST_ITEMS';
    
    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        professionalPath: updatedUser.professionalPath,
        onboardingStep: updatedUser.onboardingStep,
    });
});

// @desc Complete user onboarding
// @route PUT /api/users/complete-onboarding
// @access Private
const completeOnboarding = asyncHandler(async (req, res) => {
    const { selectedChecklistItems } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    if (!user.professionalPath) {
        res.status(400);
        throw new Error('Professional path must be set before completing onboarding');
    }
    
    if (!selectedChecklistItems || selectedChecklistItems.length === 0) {
        res.status(400);
        throw new Error('Please select at least one checklist item');
    }
    
    // Create checklist items for the user
    try {
        await createChecklistForUser(user._id, selectedChecklistItems);
    } catch (error) {
        console.error('Failed to create checklist items:', error);
        res.status(500);
        throw new Error('Failed to initialize checklist');
    }
    
    // Update user's onboarding status
    user.onboardingCompleted = true;
    user.onboardingStep = 'COMPLETED';
    
    const updatedUser = await user.save();
    
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        professionalPath: updatedUser.professionalPath,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingStep: updatedUser.onboardingStep,
    });
});

// @desc Get user onboarding status
// @route GET /api/users/onboarding-status
// @access Private
const getOnboardingStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        professionalPath: user.professionalPath,
    });
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;
    
    // Check if profile is completed
    user.profileCompleted = !!(user.name && user.bio && user.location);

    // Update notification preferences if provided
    if (req.body.notificationPreferences) {
        user.notificationPreferences = {
            ...user.notificationPreferences,
            ...req.body.notificationPreferences,
        };
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        profileCompleted: updatedUser.profileCompleted,
        notificationPreferences: updatedUser.notificationPreferences,
    });
});

// @desc Logout user (clear any server-side sessions if needed)
// @route POST /api/users/logout
// @access Private
const logoutUser = asyncHandler(async (req, res) => {
    // Update user online status
    const user = await User.findById(req.user._id);
    if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        user.socketIds = [];
        await user.save();
    }

    res.json({ message: 'Logged out successfully' });
});

export {
    loginUser,
    registerUser,
    getMe,
    updateProfessionalPath,
    completeOnboarding,
    getOnboardingStatus,
    updateProfile,
    logoutUser,
};