// Test script to verify cache invalidation is working
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUzNjQ3OTQ5NjZlMTY1MDE2ZWQ2YmIiLCJpYXQiOjE3MzM1MDc0MDAsImV4cCI6MTczMzU5MzgwMH0.s2UfKxz0QxoXTLaZO6aM-s5qjbU-nYp_fJJxyMJ-kFU';

// Create axios instance with auth token
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testCacheInvalidation() {
    console.log('🧪 Testing Cache Invalidation...\n');
    
    try {
        // 1. Test Budget API
        console.log('1️⃣ Testing Budget API:');
        const budgetResponse1 = await apiClient.get('/budget');
        console.log('   Initial budget entries count:', budgetResponse1.data.length);
        
        // Create a new budget entry
        const newEntry = await apiClient.post('/budget', {
            type: 'EXPENSE',
            category: 'Test Category',
            amount: 100,
            description: 'Test entry for cache invalidation',
            entryDate: new Date()
        });
        console.log('   ✅ Created new budget entry:', newEntry.data._id);
        
        // Fetch budget entries again (should bypass cache)
        const budgetResponse2 = await apiClient.get('/budget');
        console.log('   Updated budget entries count:', budgetResponse2.data.length);
        console.log('   Cache invalidation working:', budgetResponse2.data.length > budgetResponse1.data.length ? '✅ YES' : '❌ NO');
        
        // Clean up
        await apiClient.delete(`/budget/${newEntry.data._id}`);
        console.log('   🧹 Cleaned up test entry\n');
        
        // 2. Test Checklist API
        console.log('2️⃣ Testing Checklist API:');
        const checklistResponse1 = await apiClient.get('/checklist');
        console.log('   Initial checklist items:', checklistResponse1.data.length);
        
        if (checklistResponse1.data.length > 0) {
            const item = checklistResponse1.data[0];
            const originalStatus = item.isCompleted;
            
            // Toggle item status
            await apiClient.patch(`/checklist/${item.itemKey}`, {
                isCompleted: !originalStatus
            });
            console.log('   ✅ Toggled checklist item status');
            
            // Fetch checklist again
            const checklistResponse2 = await apiClient.get('/checklist');
            const updatedItem = checklistResponse2.data.find(i => i.itemKey === item.itemKey);
            console.log('   Cache invalidation working:', updatedItem.isCompleted !== originalStatus ? '✅ YES' : '❌ NO');
            
            // Revert change
            await apiClient.patch(`/checklist/${item.itemKey}`, {
                isCompleted: originalStatus
            });
            console.log('   🧹 Reverted checklist change\n');
        } else {
            console.log('   ⚠️  No checklist items to test\n');
        }
        
        // 3. Test Events API
        console.log('3️⃣ Testing Events API:');
        const eventsResponse1 = await apiClient.get('/events');
        console.log('   Initial events count:', eventsResponse1.data.length);
        
        // Create a test event
        const newEvent = await apiClient.post('/events', {
            title: 'Test Event for Cache',
            description: 'Testing cache invalidation',
            date: new Date(Date.now() + 86400000), // Tomorrow
            time: '15:00',
            location: {
                name: 'Test Location',
                address: 'Test Address'
            },
            maxAttendees: 10
        });
        console.log('   ✅ Created new event:', newEvent.data._id);
        
        // Fetch events again
        const eventsResponse2 = await apiClient.get('/events');
        console.log('   Updated events count:', eventsResponse2.data.length);
        console.log('   Cache invalidation working:', eventsResponse2.data.length > eventsResponse1.data.length ? '✅ YES' : '❌ NO');
        
        // Clean up
        await apiClient.delete(`/events/${newEvent.data._id}`);
        console.log('   🧹 Cleaned up test event\n');
        
        // 4. Test Forums API
        console.log('4️⃣ Testing Forums API:');
        const forumsResponse1 = await apiClient.get('/forums');
        console.log('   Initial forums count:', forumsResponse1.data.length);
        
        // Create a test forum
        const newForum = await apiClient.post('/forums', {
            title: 'Test Forum for Cache',
            description: 'Testing cache invalidation mechanism'
        });
        console.log('   ✅ Created new forum:', newForum.data._id);
        
        // Fetch forums again
        const forumsResponse2 = await apiClient.get('/forums');
        console.log('   Updated forums count:', forumsResponse2.data.length);
        console.log('   Cache invalidation working:', forumsResponse2.data.length > forumsResponse1.data.length ? '✅ YES' : '❌ NO');
        
        // Clean up
        await apiClient.delete(`/forums/${newForum.data._id}`);
        console.log('   🧹 Cleaned up test forum\n');
        
        console.log('✅ Cache invalidation test completed!');
        console.log('\n📝 Summary:');
        console.log('The test creates, updates, and deletes data through the API.');
        console.log('If cache invalidation is working properly, updated data should be');
        console.log('immediately visible in subsequent API calls without needing to wait');
        console.log('for the cache to expire.\n');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.log('\n⚠️  Make sure:');
        console.log('1. The backend server is running on port 5001');
        console.log('2. The test token is valid (update TEST_TOKEN if needed)');
        console.log('3. You have proper permissions to create/update/delete data');
    }
}

// Run the test
testCacheInvalidation();