import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Determine role based on secret key
    const role = adminSecret === process.env.ADMIN_SECRET_KEY ? 'admin' : 'user';

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
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
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            professionalPath: user.professionalPath,
            onboardingCompleted: user.onboardingCompleted,
            pinnedModules: user.pinnedModules,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Get current user's data
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

/**
 * @desc    Update user onboarding information
 * @route   PUT /api/users/onboarding
 * @access  Private
 */
const updateOnboarding = asyncHandler(async (req, res) => {
    const { professionalPath, pinnedModules } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.professionalPath = professionalPath || user.professionalPath;
        user.pinnedModules = pinnedModules || [];
        user.onboardingCompleted = true;
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            professionalPath: updatedUser.professionalPath,
            onboardingCompleted: updatedUser.onboardingCompleted,
            pinnedModules: updatedUser.pinnedModules,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export {
    registerUser,
    loginUser,
    getMe,
    updateOnboarding
};