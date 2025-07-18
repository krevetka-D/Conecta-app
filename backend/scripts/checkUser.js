// backend/scripts/checkUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        const password = process.argv[3];

        if (!email) {
            console.log('Usage: node checkUser.js <email> [password]');
            console.log('\nListing all users:');
            
            const users = await User.find({}, 'name email professionalPath onboardingCompleted createdAt');
            
            if (users.length === 0) {
                console.log('No users found in database');
            } else {
                users.forEach(user => {
                    console.log(`\n- Name: ${user.name}`);
                    console.log(`  Email: ${user.email}`);
                    console.log(`  Path: ${user.professionalPath || 'Not set'}`);
                    console.log(`  Onboarding: ${user.onboardingCompleted ? 'Completed' : 'Pending'}`);
                    console.log(`  Created: ${user.createdAt}`);
                });
            }
            return;
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`\nUser with email "${email}" not found`);
            return;
        }

        console.log(`\nUser found:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Professional Path: ${user.professionalPath || 'Not set'}`);
        console.log(`- Onboarding Completed: ${user.onboardingCompleted}`);
        console.log(`- Created: ${user.createdAt}`);

        // If password provided, test it
        if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`\nPassword test: ${isMatch ? 'CORRECT' : 'INCORRECT'}`);
            
            if (!isMatch) {
                console.log('The provided password does not match the stored password hash');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkUser();