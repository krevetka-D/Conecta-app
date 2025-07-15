import axios from 'axios';
import { API_URL } from '@env'; // Imports the API_URL from your .env file
import * as storage from '../utils/storage';

// 1. Create a configured instance of axios
// This instance will have the base URL and headers preset for all requests.
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Set up an interceptor to automatically add the auth token to every request
// This function runs before any request is sent.
api.interceptors.request.use(
    async (config) => {
        // Retrieve the token from secure storage
        const token = await storage.getItem('userToken');
        if (token) {
            // If a token exists, add it to the 'Authorization' header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle any errors that occur during the request setup
        return Promise.reject(error);
    }
);

export default api;

// --- API Function Library ---
// Here we define a clean function for each backend endpoint.

// --- User Authentication ---
/**
 * Logs in a user.
 * @param {object} userData - { email, password }
 */
export const loginUser = (userData) => api.post('/users/login', userData);

/**
 * Registers a new user.
 * @param {object} userData - { name, email, password, role }
 */
export const registerUser = (userData) => api.post('/users', userData);

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getUserProfile = () => api.get('/users/profile');


// --- Budget Management ---
/**
 * Fetches all budget entries for the user.
 */
export const getBudget = () => api.get('/budget');

/**
 * Adds a new entry to the budget.
 * @param {object} entryData - { description, amount, type, category }
 */
export const addBudgetEntry = (entryData) => api.post('/budget', entryData);

/**
 * Deletes a specific budget entry by its ID.
 * @param {string} entryId - The ID of the budget entry to delete.
 */
export const deleteBudgetEntry = (entryId) => api.delete(`/budget/${entryId}`);


// --- Checklist Management ---
/**
 * Fetches all checklist items for the user.
 */
export const getChecklist = () => api.get('/checklist');

/**
 * Updates a checklist item (e.g., marks it as complete).
 * @param {string} id - The ID of the checklist item.
 * @param {object} updates - The fields to update, e.g., { isCompleted: true }
 */
export const updateChecklistItem = (id, updates) => api.put(`/checklist/${id}`, updates);


// --- Content (Guides & Directory) ---
/**
 * Fetches all guides.
 */
export const getGuides = () => api.get('/content/guides');

/**
 * Fetches all items in the service directory.
 */
export const getDirectory = () => api.get('/content/directory');


// --- Forum ---
/**
 * Fetches all forum threads.
 */
export const getThreads = () => api.get('/forum');

/**
 * Creates a new forum thread.
 * @param {object} threadData - { title, content }
 */
export const createThread = (threadData) => api.post('/forum', threadData);

/**
 * Fetches a single thread and its posts by its ID.
 * @param {string} threadId - The ID of the thread.
 */
export const getThreadById = (threadId) => api.get(`/forum/${threadId}`);

/**
 * Adds a new post to a thread.
 * @param {string} threadId - The ID of the thread to post in.
 * @param {object} postData - { content }
 */
export const addPostToThread = (threadId, postData) => api.post(`/forum/${threadId}/posts`, postData);