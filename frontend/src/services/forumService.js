// src/services/forumService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const forumService = {
    getForums: async () => {
        const response = await apiClient.get(API_ENDPOINTS.FORUM.LIST);
        return response;
    },

    createForum: async (title, description) => {
        const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE, {
            title,
            description,
        });
        return response;
    },

    getForumDetail: async (forumId) => {
        const response = await apiClient.get(API_ENDPOINTS.FORUM.DETAIL(forumId));
        return response;
    },

    createThread: async (forumId, title, content) => {
        const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE_THREAD(forumId), {
            title,
            content,
        });
        return response;
    },

    createPost: async (threadId, content) => {
        const response = await apiClient.post(API_ENDPOINTS.FORUM.CREATE_POST(threadId), {
            content,
        });
        return response;
    },

    likePost: async (postId) => {
        const response = await apiClient.post(API_ENDPOINTS.FORUM.LIKE_POST(postId));
        return response;
    },
};

export default forumService;