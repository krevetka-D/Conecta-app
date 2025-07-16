import api from './api';

const contentService = {
    getGuides: async (path) => {
        const params = path ? { path } : {};
        const response = await api.get('/content/guides', { params });
        return response;
    },

    getGuideBySlug: async (slug) => {
        const response = await api.get(`/content/guides/${slug}`);
        return response;
    },

    getDirectory: async (category) => {
        const params = category ? { category } : {};
        const response = await api.get('/content/directory', { params });
        return response;
    },
};

export default contentService;