import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import BudgetEntry from '../models/BudgetEntry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const BUDGET_ENTRY_ID = '68801df9880b6c29c31470b5';

async function checkBudgetEntry() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/conecta_alicante');
        console.log('✅ Connected to MongoDB');

        // Check if the entry exists
        console.log(`\n🔍 Searching for budget entry with ID: ${BUDGET_ENTRY_ID}`);
        
        const entry = await BudgetEntry.findById(BUDGET_ENTRY_ID);
        
        if (entry) {
            console.log('\n✅ Budget entry found:');
            console.log(JSON.stringify(entry.toObject(), null, 2));
            
            // Check if it's a valid ObjectId
            console.log('\n📋 Entry details:');
            console.log(`- User ID: ${entry.user}`);
            console.log(`- Type: ${entry.type}`);
            console.log(`- Category: ${entry.category}`);
            console.log(`- Amount: ${entry.amount}`);
            console.log(`- Created: ${entry.createdAt}`);
            console.log(`- Updated: ${entry.updatedAt}`);
        } else {
            console.log('\n❌ Budget entry NOT found');
            
            // Check if it's a valid ObjectId format
            if (mongoose.Types.ObjectId.isValid(BUDGET_ENTRY_ID)) {
                console.log('✅ The ID is in valid MongoDB ObjectId format');
                
                // Search for similar entries
                console.log('\n🔍 Searching for recent budget entries to check for patterns...');
                const recentEntries = await BudgetEntry.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('_id createdAt');
                    
                console.log('\nRecent budget entry IDs:');
                recentEntries.forEach(entry => {
                    console.log(`- ${entry._id} (created: ${entry.createdAt})`);
                });
            } else {
                console.log('❌ The ID is NOT in valid MongoDB ObjectId format');
            }
        }
        
        // Check for any deletion logs or patterns
        console.log('\n🔍 Checking database statistics...');
        const totalEntries = await BudgetEntry.countDocuments();
        console.log(`Total budget entries in database: ${totalEntries}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

checkBudgetEntry();