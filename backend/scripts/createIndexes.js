// backend/scripts/createIndexes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createIndexes = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');

        const db = mongoose.connection.db;

        // Event indexes
        console.log('\n📌 Creating Event indexes...');
        try {
            const eventsCollection = db.collection('events');
            
            // Drop existing indexes first (except _id)
            try {
                const existingIndexes = await eventsCollection.indexes();
                for (const index of existingIndexes) {
                    if (index.name !== '_id_') {
                        await eventsCollection.dropIndex(index.name);
                    }
                }
            } catch (e) {
                console.log('No existing indexes to drop');
            }

            await eventsCollection.createIndex({ date: 1, isCancelled: 1 });
            console.log('✓ Created index: date_1_isCancelled_1');
            
            await eventsCollection.createIndex({ organizer: 1, date: -1 });
            console.log('✓ Created index: organizer_1_date_-1');
            
            await eventsCollection.createIndex({ attendees: 1 });
            console.log('✓ Created index: attendees_1');
            
            await eventsCollection.createIndex({ category: 1, date: 1 });
            console.log('✓ Created index: category_1_date_1');
            
            await eventsCollection.createIndex({ tags: 1 });
            console.log('✓ Created index: tags_1');
            
            await eventsCollection.createIndex({ title: 'text', description: 'text' });
            console.log('✓ Created text index for search');
        } catch (e) {
            console.log('⚠️  Some event indexes may already exist:', e.message);
        }

        // Forum indexes
        console.log('\n📌 Creating Forum indexes...');
        try {
            const forumsCollection = db.collection('forums');
            
            await forumsCollection.createIndex({ title: 1 }, { unique: true });
            console.log('✓ Created unique index: title_1');
            
            await forumsCollection.createIndex({ user: 1 });
            console.log('✓ Created index: user_1');
            
            await forumsCollection.createIndex({ createdAt: -1 });
            console.log('✓ Created index: createdAt_-1');
        } catch (e) {
            console.log('⚠️  Some forum indexes may already exist:', e.message);
        }

        // Thread indexes
        console.log('\n📌 Creating Thread indexes...');
        try {
            const threadsCollection = db.collection('threads');
            
            await threadsCollection.createIndex({ forum: 1, createdAt: -1 });
            console.log('✓ Created compound index: forum_1_createdAt_-1');
            
            await threadsCollection.createIndex({ author: 1 });
            console.log('✓ Created index: author_1');
        } catch (e) {
            console.log('⚠️  Some thread indexes may already exist:', e.message);
        }

        // Post indexes
        console.log('\n📌 Creating Post indexes...');
        try {
            const postsCollection = db.collection('posts');
            
            await postsCollection.createIndex({ thread: 1, createdAt: 1 });
            console.log('✓ Created compound index: thread_1_createdAt_1');
            
            await postsCollection.createIndex({ author: 1 });
            console.log('✓ Created index: author_1');
        } catch (e) {
            console.log('⚠️  Some post indexes may already exist:', e.message);
        }

        // User indexes
        console.log('\n📌 Creating User indexes...');
        try {
            const usersCollection = db.collection('users');
            
            // Email index should already exist from the schema, but let's ensure it
            await usersCollection.createIndex({ email: 1 }, { unique: true });
            console.log('✓ Created unique index: email_1');
            
            await usersCollection.createIndex({ professionalPath: 1 });
            console.log('✓ Created index: professionalPath_1');
        } catch (e) {
            console.log('⚠️  Some user indexes may already exist:', e.message);
        }

        // Budget Entry indexes
        console.log('\n📌 Creating Budget Entry indexes...');
        try {
            const budgetEntriesCollection = db.collection('budgetentries');
            
            await budgetEntriesCollection.createIndex({ user: 1, entryDate: -1 });
            console.log('✓ Created compound index: user_1_entryDate_-1');
            
            await budgetEntriesCollection.createIndex({ user: 1, type: 1 });
            console.log('✓ Created compound index: user_1_type_1');
            
            await budgetEntriesCollection.createIndex({ user: 1, category: 1 });
            console.log('✓ Created compound index: user_1_category_1');
        } catch (e) {
            console.log('⚠️  Some budget indexes may already exist:', e.message);
        }

        // Checklist indexes
        console.log('\n📌 Creating Checklist indexes...');
        try {
            const checklistCollection = db.collection('checklistitems');
            
            // This should already exist from the schema
            await checklistCollection.createIndex({ user: 1, itemKey: 1 }, { unique: true });
            console.log('✓ Created unique compound index: user_1_itemKey_1');
        } catch (e) {
            console.log('⚠️  Checklist indexes may already exist:', e.message);
        }

        console.log('\n✅ All indexes created successfully!');
        console.log('\nDatabase optimization complete.');
        
        // List all collections and their indexes
        console.log('\n📊 Current indexes summary:');
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const indexes = await coll.indexes();
            console.log(`\n${collection.name}:`);
            indexes.forEach(index => {
                console.log(`  - ${index.name}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating indexes:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};

// Run the script
console.log('🚀 Starting database optimization...');
console.log(`📁 Using MongoDB URI from: ${path.resolve(__dirname, '../.env')}`);
createIndexes();