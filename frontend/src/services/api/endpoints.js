// src/services/api/endpoints.js
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',  // ← CHANGED TO MATCH BACKEND ROUTE
        ME: '/users/me',
        UPDATE_ONBOARDING: '/users/onboarding',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/password',
        LOGOUT: '/users/logout',
    },

    // Budget endpoints
    BUDGET: {
        LIST: '/budget',
        CREATE: '/budget',
        UPDATE: (id) => `/budget/${id}`,
        DELETE: (id) => `/budget/${id}`,
        SUMMARY: '/budget/summary',
        EXPORT: '/budget/export',
    },

    // Checklist endpoints
    CHECKLIST: {
        LIST: '/checklist',
        UPDATE: (itemKey) => `/checklist/${itemKey}`,
        RESET: '/checklist/reset',
    },

    // Content endpoints
    CONTENT: {
        GUIDES: '/content/guides',
        GUIDE_DETAIL: (slug) => `/content/guides/${slug}`,
        DIRECTORY: '/content/directory',
        SEARCH: '/content/search',
    },

    // Forum endpoints
    FORUM: {
        LIST: '/forums',
        CREATE: '/forums',
        DETAIL: (id) => `/forums/${id}`,
        CREATE_THREAD: (forumId) => `/forums/${forumId}/threads`,
        CREATE_POST: (threadId) => `/forums/threads/${threadId}/posts`,
        LIKE_POST: (postId) => `/forums/posts/${postId}/like`,
    },

    // Events endpoints
    EVENTS: {
        LIST: '/events',
        DETAIL: (id) => `/events/${id}`,
        REGISTER: (id) => `/events/${id}/register`,
        UNREGISTER: (id) => `/events/${id}/unregister`,
        UPCOMING: '/events/upcoming',
        DELETE: '/events'
    },

    // Notifications endpoints
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        SETTINGS: '/notifications/settings',
    },

    // File upload
    UPLOAD: {
        IMAGE: '/upload/image',
        DOCUMENT: '/upload/document',
    },
    MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    GET: '/messages',
    SEND: '/messages',
    MARK_READ: '/messages/read'
},
    STATS: {
    USER: '/stats/user',
    DASHBOARD: '/stats/dashboard'
},
};