import mongoose from 'mongoose';

/**
 * Create database indexes for better query performance
 */
export const createDatabaseIndexes = async () => {
    try {
        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            console.log('Waiting for database connection to be ready...');
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
                // If already connected, resolve immediately
                if (mongoose.connection.readyState === 1) {
                    resolve();
                }
            });
        }
        
        console.log('Creating database indexes...');
        
        // Helper function to safely create indexes
        const createIndexSafely = async (collection, index, options = {}) => {
            try {
                // Ensure collection exists before creating index
                if (!collection || !collection.createIndex) {
                    console.error(`Collection ${collection?.collectionName || 'unknown'} not ready for indexing`);
                    return;
                }
                await collection.createIndex(index, options);
            } catch (error) {
                if (error.code === 85) {
                    // Index already exists with different options, skip
                    console.log(`Index already exists for ${collection.collectionName}: ${JSON.stringify(index)}`);
                } else if (error.code !== 86) {
                    // 86 = IndexKeySpecsConflict (index already exists with same key)
                    console.error(`Error creating index for ${collection.collectionName}:`, error.message);
                }
            }
        };

        // User indexes
        const User = mongoose.model('User');
        await createIndexSafely(User.collection, { email: 1 }, { unique: true });
        await createIndexSafely(User.collection, { isOnline: 1 });
        await createIndexSafely(User.collection, { professionalPath: 1 });
        await createIndexSafely(User.collection, { createdAt: -1 });

        // Event indexes
        const Event = mongoose.model('Event');
        await createIndexSafely(Event.collection, { date: 1 });
        await createIndexSafely(Event.collection, { organizer: 1 });
        await createIndexSafely(Event.collection, { attendees: 1 });
        await createIndexSafely(Event.collection, { category: 1 });
        await createIndexSafely(Event.collection, { targetAudience: 1 });
        await createIndexSafely(Event.collection, { isCancelled: 1, date: 1 });
        await createIndexSafely(Event.collection, { 
            title: 'text', 
            description: 'text', 
            tags: 'text' 
        });

        // Forum indexes
        const Forum = mongoose.model('Forum');
        await createIndexSafely(Forum.collection, { user: 1 });
        await createIndexSafely(Forum.collection, { lastActivity: -1 });
        await createIndexSafely(Forum.collection, { isActive: 1 });
        await createIndexSafely(Forum.collection, { 
            title: 'text', 
            description: 'text' 
        });

        // ChatMessage indexes
        const ChatMessage = mongoose.model('ChatMessage');
        await createIndexSafely(ChatMessage.collection, { roomId: 1, createdAt: -1 });
        await createIndexSafely(ChatMessage.collection, { sender: 1 });
        await createIndexSafely(ChatMessage.collection, { deleted: 1 });
        await createIndexSafely(ChatMessage.collection, { 'readBy.user': 1 });

        // BudgetEntry indexes
        const BudgetEntry = mongoose.model('BudgetEntry');
        await createIndexSafely(BudgetEntry.collection, { user: 1, entryDate: -1 });
        await createIndexSafely(BudgetEntry.collection, { type: 1 });
        await createIndexSafely(BudgetEntry.collection, { category: 1 });

        // ChecklistItem indexes
        const ChecklistItem = mongoose.model('ChecklistItem');
        await createIndexSafely(ChecklistItem.collection, { user: 1, itemKey: 1 }, { unique: true });
        await createIndexSafely(ChecklistItem.collection, { isCompleted: 1 });

        // Guide indexes
        const Guide = mongoose.model('Guide');
        await createIndexSafely(Guide.collection, { slug: 1 }, { unique: true });
        await createIndexSafely(Guide.collection, { professionalPath: 1 });
        await createIndexSafely(Guide.collection, { tags: 1 });
        await createIndexSafely(Guide.collection, { 
            title: 'text', 
            content: 'text', 
            tags: 'text' 
        });

        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.error('Error creating database indexes:', error);
    }
};

/**
 * Database query optimization tips
 */
export const optimizationTips = {
    // Use projections to limit fields
    useProjections: true,
    
    // Use lean() for read-only queries
    useLean: true,
    
    // Limit results
    defaultLimit: 50,
    maxLimit: 100,
    
    // Use indexes for sorting
    indexedSortFields: ['createdAt', 'date', 'lastActivity', 'entryDate'],
    
    // Cache frequently accessed data
    cacheableQueries: ['categories', 'config', 'publicForums'],
    
    // Use aggregation pipeline for complex queries
    useAggregation: ['dashboard', 'budgetSummary', 'eventStats']
};

/**
 * Monitor slow queries
 */
export const enableSlowQueryLogging = () => {
    if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', (collectionName, method, query, doc, options) => {
            const start = Date.now();
            
            // Log queries that take more than 100ms
            process.nextTick(() => {
                const duration = Date.now() - start;
                if (duration > 100) {
                    console.warn(`SLOW QUERY [${duration}ms]:`, {
                        collection: collectionName,
                        method,
                        query: JSON.stringify(query).substring(0, 100) + '...'
                    });
                }
            });
        });
    }
};