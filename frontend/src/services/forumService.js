
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

// Cache for forums to reduce API calls
let forumsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const forumService = {
    getForums: async (forceRefresh = false) => {
        // Check cache first
        if (!forceRefresh && forumsCache && cacheTimestamp && 
            (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            return forumsCache;
        }

        try {
            const response = await apiClient.get(API_ENDPOINTS.FORUM.LIST);
            
            // Update cache
            forumsCache = response;
            cacheTimestamp = Date.now();
            
            return response;
        } catch (error) {
            console.error('Failed to fetch forums:', error);
            
            // Return cached data if available, even if expired
            if (forumsCache) {
                console.warn('Returning stale cache due to error');
                return forumsCache;
            }
            
            // Return empty array as fallback
            return [];
        }
    },

    createForum: async (title, description, tags = []) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE, {
                title: title.trim(),
                description: description.trim(),
                tags: tags.filter(tag => tag.trim()) // Remove empty tags
            });
            
            // Clear cache after creating forum
            forumsCache = null;
            cacheTimestamp = null;
            
            return response;
        } catch (error) {
            console.error('Failed to create forum:', error);
            
            // Provide better error messages
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 400) {
                throw new Error('Invalid forum data. Please check your input.');
            } else if (error.response?.status === 401) {
                throw new Error('You must be logged in to create a forum.');
            } else {
                throw new Error('Failed to create forum. Please try again.');
            }
        }
    },

    getForumDetail: async (forumId) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.FORUM.DETAIL(forumId));
            return response;
        } catch (error) {
            console.error('Failed to fetch forum details:', error);
            
            if (error.response?.status === 404) {
                throw new Error('Forum not found');
            }
            throw new Error('Failed to load forum details');
        }
    },

    createThread: async (forumId, title, content) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE_THREAD(forumId), {
                title: title.trim(),
                content: content.trim(),
            });
            
            // Clear forum detail cache
            return response;
        } catch (error) {
            console.error('Failed to create thread:', error);
            
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 404) {
                throw new Error('Forum not found');
            } else if (error.response?.status === 401) {
                throw new Error('You must be logged in to create a thread.');
            } else {
                throw new Error('Failed to create thread. Please try again.');
            }
        }
    },

    createPost: async (threadId, content) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE_POST(threadId), {
                content: content.trim(),
            });
            return response;
        } catch (error) {
            console.error('Failed to create post:', error);
            
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 404) {
                throw new Error('Thread not found');
            } else if (error.response?.status === 401) {
                throw new Error('You must be logged in to post.');
            } else {
                throw new Error('Failed to create post. Please try again.');
            }
        }
    },

    likePost: async (postId) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FORUM.LIKE_POST(postId));
            return response;
        } catch (error) {
            console.error('Failed to like post:', error);
            throw new Error('Failed to like post');
        }
    },

    deleteForum: async (forumId) => {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.FORUM.DELETE(forumId));
            
            // Clear cache after deleting forum
            forumsCache = null;
            cacheTimestamp = null;
            
            return response;
        } catch (error) {
            console.error('Error deleting forum:', error);
            
            if (error.response?.status === 403) {
                throw new Error('You can only delete forums you created.');
            } else if (error.response?.status === 404) {
                throw new Error('Forum not found');
            }
            throw new Error('Failed to delete forum');
        }
    },

    deleteThread: async (threadId) => {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.FORUM.DELETE_THREAD(threadId));
            return response;
        } catch (error) {
            console.error('Error deleting thread:', error);
            
            if (error.response?.status === 403) {
                throw new Error('You can only delete threads you created.');
            } else if (error.response?.status === 404) {
                throw new Error('Thread not found');
            }
            throw new Error('Failed to delete thread');
        }
    },

    // Clear forums cache when user logs out or changes
    clearCache: () => {
        forumsCache = null;
        cacheTimestamp = null;
    }
};

export default forumService;