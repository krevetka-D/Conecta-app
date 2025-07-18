// backend/scripts/createTestUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('Test user already exists');
            console.log('Email: test@example.com');
            console.log('Name:', existingUser.name);
            return;
        }

        // Create test user
        const testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123', // This will be hashed automatically
            professionalPath: 'FREELANCER',
            onboardingCompleted: true,
        });

        console.log('Test user created successfully!');
        console.log('Email: test@example.com');
        console.log('Password: test123');
        console.log('User ID:', testUser._id);
        
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestUser();