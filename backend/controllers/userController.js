import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users
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
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
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

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && (await user.matchPassword(password))) {
        // Respond with user data and a new token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            // ** CRITICAL FIX **: Generate and include the token in the login response
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private (requires token)
 */
export const getMe = asyncHandler(async (req, res) => {
    // The `protect` middleware already fetched the user and attached it to the request.
    // We just need to find the fresh data from the database.
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
 * @access  Private (requires token)
 */
export const updateOnboarding = asyncHandler(async (req, res) => {
    const { professionalPath, pinnedModules } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.professionalPath = professionalPath ?? user.professionalPath;
        user.pinnedModules = pinnedModules ?? user.pinnedModules;
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