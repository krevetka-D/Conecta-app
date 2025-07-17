// backend/scripts/fixChecklistIndex.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const db = mongoose.connection.db;
        const collection = db.collection('checklistitems');
        
        // Drop the old index if it exists
        try {
            await collection.dropIndex({ userId: 1, itemKey: 1 });
            console.log('Dropped old index');
        } catch (e) {
            console.log('Old index not found or already dropped');
        }
        
        // The new index will be created automatically by the model
        console.log('Index fix completed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndex();