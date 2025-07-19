// Backend optimization script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const optimizeDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Create indexes
        const db = mongoose.connection.db;
        
        // Budget indexes
        await db.collection('budgetentries').createIndex({ user: 1, entryDate: -1 });
        await db.collection('budgetentries').createIndex({ user: 1, type: 1, entryDate: -1 });
        
        // Forum indexes
        await db.collection('forums').createIndex({ title: 'text', description: 'text' });
        await db.collection('forums').createIndex({ lastActivity: -1, isActive: 1 });
        
        // Thread indexes
        await db.collection('threads').createIndex({ forum: 1, isPinned: -1, updatedAt: -1 });
        
        console.log('Database optimization complete');
        process.exit(0);
    } catch (error) {
        console.error('Optimization failed:', error);
        process.exit(1);
    }
};

optimizeDatabase();