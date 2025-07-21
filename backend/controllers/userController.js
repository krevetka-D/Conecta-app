import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ChecklistItem from '../models/ChecklistItem.js';
import { CHECKLIST_ITEMS } from '../config/constants.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with that email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        // Don't set professionalPath yet - user will select it after registration
        professionalPath: undefined,
        onboardingCompleted: false,
        onboardingStep: 'SELECT_PATH' // New field to track onboarding progress
    });

    if (user) {
        const token = generateToken(user._id);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                professionalPath: user.professionalPath,
                hasCompletedOnboarding: false,
                onboardingStep: user.onboardingStep,
                pinnedModules: [],
            },
            token: token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @desc    Update user's professional path
 * @route   PUT /api/users/professional-path
 * @access  Private
 */
export const updateProfessionalPath = asyncHandler(async (req, res) => {
    const { professionalPath } = req.body;

    if (!professionalPath || !['FREELANCER', 'ENTREPRENEUR'].includes(professionalPath)) {
        res.status(400);
        throw new Error('Invalid professional path');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.professionalPath = professionalPath;
    user.onboardingStep = 'SELECT_CHECKLIST_ITEMS';
    await user.save();

    // Get available checklist items for the selected path
    const checklistItemsForPath = CHECKLIST_ITEMS[professionalPath] || [];

    res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            professionalPath: user.professionalPath,
            hasCompletedOnboarding: false,
            onboardingStep: user.onboardingStep,
        },
        availableChecklistItems: checklistItemsForPath
    });
});

/**
 * @desc    Complete onboarding with selected checklist items
 * @route   PUT /api/users/complete-onboarding
 * @access  Private
 */
export const completeOnboarding = asyncHandler(async (req, res) => {
    const { selectedChecklistItems, pinnedModules } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.professionalPath) {
        res.status(400);
        throw new Error('Professional path must be selected first');
    }

    // Create checklist items for the user
    if (selectedChecklistItems && selectedChecklistItems.length > 0) {
        const checklistItemsToCreate = selectedChecklistItems.map(itemKey => ({
            user: user._id,
            itemKey,
            isCompleted: false
        }));

        await ChecklistItem.insertMany(checklistItemsToCreate);
    }

    // Update user
    user.pinnedModules = pinnedModules || [];
    user.onboardingCompleted = true;
    user.onboardingStep = 'COMPLETED';
    await user.save();

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        professionalPath: user.professionalPath,
        hasCompletedOnboarding: true,
        onboardingStep: user.onboardingStep,
        pinnedModules: user.pinnedModules,
    });
});

/**
 * @desc    Get onboarding status
 * @route   GET /api/users/onboarding-status
 * @access  Private
 */
export const getOnboardingStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let response = {
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep || 'SELECT_PATH',
        professionalPath: user.professionalPath
    };

    // If user has selected path but not completed onboarding, send checklist items
    if (user.professionalPath && !user.onboardingCompleted) {
        response.availableChecklistItems = CHECKLIST_ITEMS[user.professionalPath] || [];
    }

    res.status(200).json(response);
});

/**
 * @desc    Authenticate a user (login)
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        // Update last login and online status
        user.lastLogin = new Date();
        user.isOnline = true;
        await user.save();

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                professionalPath: user.professionalPath,
                hasCompletedOnboarding: user.onboardingCompleted,
                onboardingStep: user.onboardingStep || (user.onboardingCompleted ? 'COMPLETED' : 'SELECT_PATH'),
                pinnedModules: user.pinnedModules || [],
            },
            token: token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
    }

    res.json({ message: 'Logged out successfully' });
});

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            professionalPath: user.professionalPath,
            hasCompletedOnboarding: user.onboardingCompleted,
            onboardingStep: user.onboardingStep || (user.onboardingCompleted ? 'COMPLETED' : 'SELECT_PATH'),
            pinnedModules: user.pinnedModules || [],
            isOnline: user.isOnline,
            lastSeen: user.lastSeen
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            professionalPath: updatedUser.professionalPath,
            hasCompletedOnboarding: updatedUser.onboardingCompleted,
            pinnedModules: updatedUser.pinnedModules,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});