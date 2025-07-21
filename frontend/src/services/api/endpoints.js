export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',
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
        CATEGORIES: '/budget/categories',
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
        UPDATE: (id) => `/forums/${id}`,
        DELETE: (id) => `/forums/${id}`,
        CREATE_THREAD: (forumId) => `/forums/${forumId}/threads`,
        DELETE_THREAD: (threadId) => `/forums/threads/${threadId}`,
        CREATE_POST: (threadId) => `/forums/threads/${threadId}/posts`,
        LIKE_POST: (postId) => `/forums/posts/${postId}/like`,
    },

    // Events endpoints
    EVENTS: {
        LIST: '/events',
        CREATE: '/events',
        DETAIL: (id) => `/events/${id}`,
        UPDATE: (id) => `/events/${id}`,
        DELETE: (id) => `/events/${id}`,
        JOIN: (id) => `/events/${id}/join`,
        LEAVE: (id) => `/events/${id}/leave`,
        UPCOMING: '/events/upcoming',
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
    CHAT: {
        ROOMS: '/chat/rooms',
        ROOM_MESSAGES: (roomId) => `/chat/rooms/${roomId}/messages`,
        SEND_MESSAGE: (roomId) => `/chat/rooms/${roomId}/messages`,
        SEARCH: '/chat/search',
    },

    // Messages
    MESSAGES: {
        CONVERSATIONS: '/messages/conversations',
        GET: '/messages',
        SEND: '/messages',
        MARK_READ: '/messages/read'
    },

    // Stats
    STATS: {
        USER: '/stats/user',
        DASHBOARD: '/stats/dashboard'
    },

    // Config
    CONFIG: {
        CATEGORIES: '/config/categories',
    },
};
