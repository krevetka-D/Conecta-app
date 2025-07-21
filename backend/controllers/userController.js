
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { createChecklistForUser } from './checklistController.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, professionalPath } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Validate professional path
    if (professionalPath && !['FREELANCER', 'ENTREPRENEUR'].includes(professionalPath)) {
        res.status(400);
        throw new Error('Invalid professional path');
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
        professionalPath: professionalPath || undefined,
        onboardingCompleted: !!professionalPath,
    });

    if (user) {
        const token = generateToken(user._id);

        // Create checklist items if professional path is provided
        if (professionalPath) {
            await createChecklistForUser(user._id, professionalPath);
        }

        // Frontend expects 'user' and 'token' at root level
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                professionalPath: user.professionalPath,
                hasCompletedOnboarding: user.onboardingCompleted,
                pinnedModules: user.pinnedModules || [],
            },
            token: token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
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

        // Frontend expects 'user' and 'token' at root level
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                professionalPath: user.professionalPath,
                hasCompletedOnboarding: user.onboardingCompleted,
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
            pinnedModules: user.pinnedModules || [],
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Update user onboarding information
 * @route   PUT /api/users/onboarding
 * @access  Private
 */
export const updateOnboarding = asyncHandler(async (req, res) => {
    const { professionalPath, pinnedModules } = req.body;

    if (!professionalPath) {
        res.status(400);
        throw new Error('Professional path is required');
    }

    if (!['FREELANCER', 'ENTREPRENEUR'].includes(professionalPath)) {
        res.status(400);
        throw new Error('Invalid professional path');
    }

    const user = await User.findById(req.user._id);

    if (user) {
        const previousPath = user.professionalPath;
        user.professionalPath = professionalPath;
        user.pinnedModules = pinnedModules || [];
        user.onboardingCompleted = true;

        const updatedUser = await user.save();

        // Create checklist items if professional path is set for the first time
        // or if it has changed
        if (!previousPath || previousPath !== professionalPath) {
            await createChecklistForUser(user._id, professionalPath);
        }

        // Return the same format as login/register
        res.status(200).json({
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

        // Only update password if provided
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