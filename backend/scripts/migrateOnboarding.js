// backend/scripts/migrateOnboarding.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const migrateOnboarding = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to migrate`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            // Skip if already has onboardingStep
            if (user.onboardingStep) {
                skipped++;
                continue;
            }

            // Determine onboarding step based on current data
            let onboardingStep;
            
            if (user.onboardingCompleted) {
                onboardingStep = 'COMPLETED';
            } else if (user.professionalPath) {
                onboardingStep = 'SELECT_CHECKLIST_ITEMS';
            } else {
                onboardingStep = 'SELECT_PATH';
            }

            // Update user
            await User.findByIdAndUpdate(user._id, {
                onboardingStep,
                isOnline: false,
                lastSeen: user.lastSeen || user.updatedAt || new Date(),
                socketIds: []
            });

            migrated++;
            console.log(`✓ Migrated user: ${user.email} - Step: ${onboardingStep}`);
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`📊 Migrated: ${migrated} users`);
        console.log(`📊 Skipped: ${skipped} users (already migrated)`);

        // Add indexes
        console.log('\n📚 Creating indexes...');
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        await usersCollection.createIndex({ isOnline: 1, lastSeen: -1 });
        await usersCollection.createIndex({ onboardingStep: 1 });
        console.log('✅ Indexes created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
console.log('🚀 Starting onboarding migration...');
migrateOnboarding();