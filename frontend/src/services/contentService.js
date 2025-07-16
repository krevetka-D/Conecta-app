import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const contentService = {
    getGuides: async (path) => {
        const params = path ? { path } : {};
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.GUIDES, { params });
        return response;
    },

    getGuideBySlug: async (slug) => {
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.GUIDE_DETAIL(slug));
        return response;
    },

    getDirectory: async (category) => {
        const params = category ? { category } : {};
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.DIRECTORY, { params });
        return response;
    },
};

export default contentService;