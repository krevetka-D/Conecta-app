import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

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
        professionalPath: professionalPath || undefined, // Let it default to schema default if not provided
        onboardingCompleted: !!professionalPath, // If path is selected during registration, mark onboarding as completed
    });

    if (user) {
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
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

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
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
        res.status(200).json(user);
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
    const user = await User.findById(req.user._id);

    if (user) {
        user.professionalPath = professionalPath || user.professionalPath;
        user.pinnedModules = pinnedModules || user.pinnedModules;
        user.onboardingCompleted = true;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            professionalPath: updatedUser.professionalPath,
            onboardingCompleted: updatedUser.onboardingCompleted,
            pinnedModules: updatedUser.pinnedModules,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});