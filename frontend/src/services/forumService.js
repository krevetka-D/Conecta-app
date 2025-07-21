import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import mockChatService from './mockChatService';

// Cache for groups to reduce API calls
let groupsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const forumService = {
    getForums: async (forceRefresh = false) => {
        // Check cache first
        if (!forceRefresh && groupsCache && cacheTimestamp && 
            (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            return groupsCache;
        }

        try {
            const response = await apiClient.get(API_ENDPOINTS.FORUM.LIST);
            
            // Update cache
            groupsCache = response;
            cacheTimestamp = Date.now();
            
            return response;
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            
            // Return cached data if available, even if expired
            if (groupsCache) {
                console.warn('Returning stale cache due to error');
                return groupsCache;
            }
            
            // In development, return mock data if API fails
            if (__DEV__) {
                console.log('Using mock groups due to API error');
                return mockChatService.getRooms();
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
            
            // Clear cache after creating group
            groupsCache = null;
            cacheTimestamp = null;
            
            return response;
        } catch (error) {
            console.error('Failed to create group:', error);
            
            // Provide better error messages
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 400) {
                throw new Error('Invalid group data. Please check your input.');
            } else if (error.response?.status === 401) {
                throw new Error('You must be logged in to create a group.');
            } else {
                throw new Error('Failed to create group. Please try again.');
            }
        }
    },

    getForumDetail: async (forumId) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.FORUM.DETAIL(forumId));
            return response;
        } catch (error) {
            console.error('Failed to fetch group details:', error);
            
            if (error.response?.status === 404) {
                throw new Error('Group not found');
            }
            throw new Error('Failed to load group details');
        }
    },

    createThread: async (forumId, title, content) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE_THREAD(forumId), {
                title: title.trim(),
                content: content.trim(),
            });
            
            return response;
        } catch (error) {
            console.error('Failed to create thread:', error);
            
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 404) {
                throw new Error('Group not found');
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
            
            // Clear cache after deleting group
            groupsCache = null;
            cacheTimestamp = null;
            
            return response;
        } catch (error) {
            console.error('Error deleting group:', error);
            
            if (error.response?.status === 403) {
                throw new Error('You can only delete groups you created.');
            } else if (error.response?.status === 404) {
                throw new Error('Group not found');
            }
            throw new Error('Failed to delete group');
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

    // Clear groups cache when user logs out or changes
    clearCache: () => {
        groupsCache = null;
        cacheTimestamp = null;
    }
};

export default forumService;