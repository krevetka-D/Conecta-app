import axios from 'axios';
import colors from 'colors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Configuration
const BASE_URL = 'http://127.0.0.1:5001/api'; // Use IPv4 address instead of localhost
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODAxNWI5NmNlZTM2ZWI1OWMzMjFmMSIsImlhdCI6MTc1MzIyNDcyMywiZXhwIjoxNzU1ODE2NzIzfQ.OGZTFOqUChrsonVeihrGvFbTPXKdl9HpR5oMPMK007s';

// Create axios instance with default headers
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Test result tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to log test results
function logTest(testName, success, details = '') {
    totalTests++;
    if (success) {
        passedTests++;
        console.log(`✅ ${testName}`.green);
        testResults.push({ test: testName, status: 'PASSED', details });
    } else {
        failedTests++;
        console.log(`❌ ${testName}`.red);
        console.log(`   Details: ${details}`.gray);
        testResults.push({ test: testName, status: 'FAILED', details });
    }
}

// Helper function to format error messages
function formatError(error) {
    if (error.response) {
        return `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
        return 'No response received from server';
    } else {
        return error.message;
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\n📋 Testing Health Check...'.yellow);
    try {
        const response = await api.get('/health');
        logTest('Health Check', response.status === 200 && response.data.status === 'ok');
        return response.data;
    } catch (error) {
        logTest('Health Check', false, formatError(error));
        return null;
    }
}

async function testDashboard() {
    console.log('\n📊 Testing Dashboard Endpoint...'.yellow);
    try {
        const response = await api.get('/dashboard/overview');
        const hasData = response.data && 
                       response.data.userInfo && 
                       response.data.stats !== undefined;
        logTest('Dashboard - Fetch overview data', response.status === 200 && hasData);
        
        // Check for specific fields
        if (hasData) {
            logTest('Dashboard - Has user info', !!response.data.userInfo);
            logTest('Dashboard - Has stats', !!response.data.stats);
            logTest('Dashboard - Has recent activities', Array.isArray(response.data.recentActivities));
        }
        
        return response.data;
    } catch (error) {
        logTest('Dashboard - Fetch overview data', false, formatError(error));
        return null;
    }
    
    // Test dashboard events endpoint
    try {
        const response = await api.get('/dashboard/events');
        logTest('Dashboard - Fetch events', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Dashboard - Fetch events', false, formatError(error));
    }
}

async function testBudgetOperations() {
    console.log('\n💰 Testing Budget Operations...'.yellow);
    
    // Test 1: Get all budget entries
    try {
        const response = await api.get('/budget');
        logTest('Budget - Get all entries', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Budget - Get all entries', false, formatError(error));
    }
    
    // Test 2: Create a new budget entry
    const newEntry = {
        type: 'EXPENSE', // Required field
        category: 'Food',
        amount: 50.00,
        description: 'Test grocery shopping',
        entryDate: new Date().toISOString() // Correct field name
    };
    
    let createdEntryId = null;
    try {
        const response = await api.post('/budget', newEntry);
        createdEntryId = response.data._id;
        logTest('Budget - Create new entry', response.status === 201 && response.data._id);
    } catch (error) {
        logTest('Budget - Create new entry', false, formatError(error));
    }
    
    // Test 3: Update with partial data (testing the validation fix)
    if (createdEntryId) {
        const partialUpdate = {
            amount: 75.00,
            description: 'Updated test entry'
            // Intentionally not including all fields to test partial update
        };
        
        try {
            const response = await api.put(`/budget/${createdEntryId}`, partialUpdate);
            logTest('Budget - Update with partial data', response.status === 200);
        } catch (error) {
            logTest('Budget - Update with partial data', false, formatError(error));
        }
        
        // Test 4: Delete the test entry
        try {
            const response = await api.delete(`/budget/${createdEntryId}`);
            logTest('Budget - Delete entry', response.status === 200);
        } catch (error) {
            logTest('Budget - Delete entry', false, formatError(error));
        }
    }
}

async function testEventOperations() {
    console.log('\n📅 Testing Event Operations...'.yellow);
    
    // Test 1: Get all events
    try {
        const response = await api.get('/events');
        logTest('Events - Get all events', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Events - Get all events', false, formatError(error));
    }
    
    // Test 2: Create event with tomorrow's date (events must be in the future)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // Set to 2 PM tomorrow
    
    const newEvent = {
        title: 'Test Event Tomorrow',
        description: 'Testing event creation with future date',
        date: tomorrow.toISOString(),
        time: '14:00', // Required field in HH:MM format
        location: { 
            name: 'Test Location', // Location must be an object with name
            address: 'Test Address'
        },
        category: 'academic',
        organizer: 'Test Organizer',
        attendeeLimit: 50
    };
    
    let createdEventId = null;
    try {
        const response = await api.post('/events', newEvent);
        createdEventId = response.data._id;
        logTest('Events - Create event with today\'s date', response.status === 201 && response.data._id);
    } catch (error) {
        logTest('Events - Create event with today\'s date', false, formatError(error));
    }
    
    // Test 3: Update event
    if (createdEventId) {
        const updateData = {
            title: 'Updated Test Event',
            description: 'Updated description'
        };
        
        try {
            const response = await api.put(`/events/${createdEventId}`, updateData);
            logTest('Events - Update event', response.status === 200);
        } catch (error) {
            logTest('Events - Update event', false, formatError(error));
        }
        
        // Test 4: Delete event
        try {
            const response = await api.delete(`/events/${createdEventId}`);
            logTest('Events - Delete event', response.status === 200);
        } catch (error) {
            logTest('Events - Delete event', false, formatError(error));
        }
    }
}

async function testUserOperations() {
    console.log('\n👤 Testing User Operations...'.yellow);
    
    // Test 1: Get current user profile (correct endpoint is /me)
    try {
        const response = await api.get('/users/me');
        logTest('User - Get profile', response.status === 200 && response.data._id);
    } catch (error) {
        logTest('User - Get profile', false, formatError(error));
    }
    
    // Test 2: Update profile
    const profileUpdate = {
        bio: 'Test bio update ' + new Date().toISOString()
    };
    
    try {
        const response = await api.put('/users/profile', profileUpdate);
        logTest('User - Update profile', response.status === 200);
    } catch (error) {
        logTest('User - Update profile', false, formatError(error));
    }
}

async function testChecklistOperations() {
    console.log('\n✅ Testing Checklist Operations...'.yellow);
    
    // Test 1: Get all checklist items
    try {
        const response = await api.get('/checklist');
        logTest('Checklist - Get all items', response.status === 200 && response.data);
    } catch (error) {
        logTest('Checklist - Get all items', false, formatError(error));
    }
    
    // Test 2: Initialize checklist (if needed)
    try {
        const response = await api.post('/checklist/initialize');
        logTest('Checklist - Initialize', response.status === 200 || response.status === 201);
    } catch (error) {
        // May fail if already initialized, which is OK
        logTest('Checklist - Initialize', error.response?.status === 400, 
               error.response?.status === 400 ? 'Already initialized' : formatError(error));
    }
    
    // Test 3: Update a checklist item (need to get items first)
    try {
        const getResponse = await api.get('/checklist');
        if (getResponse.data && Object.keys(getResponse.data).length > 0) {
            // Find first item key
            const firstKey = Object.keys(getResponse.data)[0];
            const updateData = {
                completed: !getResponse.data[firstKey].completed
            };
            
            const response = await api.put(`/checklist/${firstKey}`, updateData);
            logTest('Checklist - Update item', response.status === 200);
        } else {
            logTest('Checklist - Update item', false, 'No items to update');
        }
    } catch (error) {
        logTest('Checklist - Update item', false, formatError(error));
    }
}

async function testContentOperations() {
    console.log('\n📚 Testing Content Operations...'.yellow);
    
    // Test 1: Get guides
    try {
        const response = await api.get('/content/guides');
        logTest('Content - Get guides', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Content - Get guides', false, formatError(error));
    }
    
    // Test 2: Get services (check if endpoint exists)
    try {
        const response = await api.get('/content/service-directory');
        logTest('Content - Get service directory', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Content - Get service directory', false, formatError(error));
    }
}

async function testChatOperations() {
    console.log('\n💬 Testing Chat Operations...'.yellow);
    
    // Test 1: Get chat rooms
    try {
        const response = await api.get('/chat/rooms');
        logTest('Chat - Get rooms', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('Chat - Get rooms', false, formatError(error));
    }
    
    // Test 2: Get messages from a specific room (need valid room ID)
    try {
        // First get rooms to find a valid ID
        const roomsResponse = await api.get('/chat/rooms');
        if (roomsResponse.data && roomsResponse.data.length > 0) {
            const roomId = roomsResponse.data[0]._id;
            const response = await api.get(`/chat/rooms/${roomId}/messages`);
            logTest('Chat - Get room messages', response.status === 200 && Array.isArray(response.data));
        } else {
            logTest('Chat - Get room messages', false, 'No chat rooms available');
        }
    } catch (error) {
        logTest('Chat - Get room messages', false, formatError(error));
    }
}

async function checkBackendLogs() {
    console.log('\n📝 Checking Backend Logs...'.yellow);
    
    try {
        // Check for recent errors in logs (last 100 lines)
        
        const { stdout } = await execPromise('tail -n 100 logs/error.log | grep -c "error" || true', {
            cwd: '/Users/macbook/Documents/projects/erasmus_proj/mobile_app_main/backend'
        });
        
        const errorCount = parseInt(stdout.trim()) || 0;
        logTest('Backend Logs - Recent errors check', errorCount === 0, 
               errorCount > 0 ? `Found ${errorCount} error entries in recent logs` : 'No recent errors');
        
    } catch (error) {
        logTest('Backend Logs - Check failed', false, error.message);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive API Tests'.blue.bold);
    console.log('================================'.blue);
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Token: ${AUTH_TOKEN.substring(0, 20)}...`);
    console.log('================================\n'.blue);
    
    // Check if server is running
    try {
        const healthResponse = await api.get('/health', { timeout: 5000 });
        console.log('✅ Server is running'.green);
        console.log(`   Server info: ${healthResponse.data.environment} mode, uptime: ${Math.round(healthResponse.data.uptime)}s`.gray);
    } catch (error) {
        console.log('❌ Server is not running! Please start the backend server first.'.red);
        console.log(`   Error: ${formatError(error)}`.gray);
        process.exit(1);
    }
    
    // Run all tests
    await testHealthCheck();
    await testDashboard();
    await testUserOperations();
    await testBudgetOperations();
    await testEventOperations();
    await testChecklistOperations();
    await testContentOperations();
    await testChatOperations();
    await checkBackendLogs();
    
    // Print summary
    console.log('\n================================'.blue);
    console.log('📊 Test Summary'.blue.bold);
    console.log('================================'.blue);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`.green);
    console.log(`❌ Failed: ${failedTests}`.red);
    console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    
    // Print failed tests details
    if (failedTests > 0) {
        console.log('\n❌ Failed Tests Details:'.red.bold);
        testResults
            .filter(result => result.status === 'FAILED')
            .forEach(result => {
                console.log(`  - ${result.test}: ${result.details}`.red);
            });
    }
    
    // Check for specific issues
    console.log('\n🔍 Common Issues Check:'.yellow.bold);
    
    // Check socket errors
    const socketErrors = testResults.filter(r => r.details.includes('socket') || r.details.includes('Socket'));
    if (socketErrors.length > 0) {
        console.log('  ⚠️  Socket-related errors detected'.yellow);
    }
    
    // Check validation errors
    const validationErrors = testResults.filter(r => r.details.includes('validation') || r.details.includes('required'));
    if (validationErrors.length > 0) {
        console.log('  ⚠️  Validation errors detected'.yellow);
    }
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});