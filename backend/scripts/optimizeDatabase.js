// backend/scripts/optimizeDatabase.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const optimizeDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB successfully');

        const db = mongoose.connection.db;

        // Forums Collection Indexes
        console.log('\n📚 Optimizing Forums Collection...');
        const forumsCollection = db.collection('forums');
        
        // Drop existing indexes except _id
        try {
            const existingIndexes = await forumsCollection.indexes();
            for (const index of existingIndexes) {
                if (index.name !== '_id_') {
                    await forumsCollection.dropIndex(index.name);
                }
            }
        } catch (e) {
            console.log('No existing indexes to drop');
        }

        // Create optimized indexes
        await forumsCollection.createIndex({ title: 1 }, { unique: true });
        await forumsCollection.createIndex({ user: 1, createdAt: -1 });
        await forumsCollection.createIndex({ isActive: 1, createdAt: -1 });
        await forumsCollection.createIndex({ tags: 1 });
        await forumsCollection.createIndex(
            { title: 'text', description: 'text' },
            { weights: { title: 3, description: 1 } }
        );
        console.log('✓ Forums indexes created');

        // Threads Collection Indexes
        console.log('\n💬 Optimizing Threads Collection...');
        const threadsCollection = db.collection('threads');
        
        await threadsCollection.createIndex({ forum: 1, createdAt: -1 });
        await threadsCollection.createIndex({ author: 1, createdAt: -1 });
        await threadsCollection.createIndex({ title: 'text' });
        console.log('✓ Threads indexes created');

        // Posts Collection Indexes
        console.log('\n📝 Optimizing Posts Collection...');
        const postsCollection = db.collection('posts');
        
        await postsCollection.createIndex({ thread: 1, createdAt: 1 });
        await postsCollection.createIndex({ author: 1, createdAt: -1 });
        await postsCollection.createIndex({ content: 'text' });
        console.log('✓ Posts indexes created');

        // Budget Entries Optimization
        console.log('\n💰 Optimizing Budget Entries Collection...');
        const budgetCollection = db.collection('budgetentries');
        
        await budgetCollection.createIndex({ user: 1, entryDate: -1 });
        await budgetCollection.createIndex({ user: 1, type: 1, entryDate: -1 });
        await budgetCollection.createIndex({ user: 1, category: 1 });
        await budgetCollection.createIndex({ user: 1, createdAt: -1 });
        console.log('✓ Budget entries indexes created');

        // Events Collection Optimization
        console.log('\n📅 Optimizing Events Collection...');
        const eventsCollection = db.collection('events');
        
        await eventsCollection.createIndex({ date: 1, isCancelled: 1 });
        await eventsCollection.createIndex({ organizer: 1, date: -1 });
        await eventsCollection.createIndex({ attendees: 1 });
        await eventsCollection.createIndex({ category: 1, targetAudience: 1, date: 1 });
        await eventsCollection.createIndex({ tags: 1 });
        await eventsCollection.createIndex(
            { title: 'text', description: 'text' },
            { weights: { title: 2, description: 1 } }
        );
        console.log('✓ Events indexes created');

        // Users Collection Optimization
        console.log('\n👤 Optimizing Users Collection...');
        const usersCollection = db.collection('users');
        
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ professionalPath: 1 });
        await usersCollection.createIndex({ createdAt: -1 });
        await usersCollection.createIndex({ name: 'text' });
        console.log('✓ Users indexes created');

        // Analyze Collection Statistics
        console.log('\n📊 Collection Statistics:');
        const collections = await db.listCollections().toArray();
        
        for (const collection of collections) {
            const stats = await db.collection(collection.name).stats();
            console.log(`\n${collection.name}:`);
            console.log(`  Documents: ${stats.count}`);
            console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Avg Doc Size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
            
            const indexes = await db.collection(collection.name).indexes();
            console.log(`  Indexes: ${indexes.length}`);
            indexes.forEach(index => {
                console.log(`    - ${index.name}: ${JSON.stringify(index.key)}`);
            });
        }

        // Performance Recommendations
        console.log('\n💡 Performance Recommendations:');
        console.log('1. Enable MongoDB profiling in production to monitor slow queries');
        console.log('2. Consider implementing Redis for caching frequently accessed data');
        console.log('3. Use MongoDB aggregation pipelines for complex queries');
        console.log('4. Enable compression for large documents');
        console.log('5. Consider sharding for collections > 10GB');

        console.log('\n✅ Database optimization complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error optimizing database:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};

// Run the optimization
console.log('🚀 Starting database optimization...');
optimizeDatabase();