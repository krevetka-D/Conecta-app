
import apiClient from './api/client';
import mockChatService from './mockChatService';

// Flag to use mock service in development when backend is unavailable
const USE_MOCK = __DEV__ && false; // Set to true to use mock service

// Cache for chat data
const chatCache = {
    rooms: null,
    roomsTimestamp: null,
    messages: new Map(), // roomId -> messages
    messagesTimestamp: new Map(), // roomId -> timestamp
};

const CACHE_DURATION = 60000; // 1 minute

const chatService = {
    // Get chat rooms with caching
    getChatRooms: async (forceRefresh = false) => {
        // Use mock service if enabled
        if (USE_MOCK) {
            return mockChatService.getRooms();
        }

        const now = Date.now();
        
        if (!forceRefresh && 
            chatCache.rooms && 
            chatCache.roomsTimestamp && 
            (now - chatCache.roomsTimestamp < CACHE_DURATION)) {
            return chatCache.rooms;
        }

        try {
            const response = await apiClient.get('/forums');
            chatCache.rooms = response;
            chatCache.roomsTimestamp = now;
            return response;
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
            // Return cached data if available
            if (chatCache.rooms) {
                return chatCache.rooms;
            }
            // Return mock data in development if API fails
            if (__DEV__) {
                console.log('Using mock chat rooms due to API error');
                return mockChatService.getRooms();
            }
            throw error;
        }
    },

    // Get room messages with caching and pagination
    getRoomMessages: async (roomId, options = {}) => {
        // Use mock service if enabled
        if (USE_MOCK) {
            return mockChatService.getRoomMessages(roomId);
        }

        const { forceRefresh = false, limit = 50, before = null } = options;
        const now = Date.now();
        const cacheKey = `${roomId}_${limit}_${before || 'latest'}`;
        
        // Check cache first
        if (!forceRefresh && 
            chatCache.messages.has(cacheKey) && 
            chatCache.messagesTimestamp.has(cacheKey) &&
            (now - chatCache.messagesTimestamp.get(cacheKey) < CACHE_DURATION)) {
            return chatCache.messages.get(cacheKey);
        }

        try {
            const params = { limit };
            if (before) {
                params.before = before;
            }

            const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
            
            // Update cache
            chatCache.messages.set(cacheKey, response);
            chatCache.messagesTimestamp.set(cacheKey, now);
            
            return response;
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Return cached data if available
            if (chatCache.messages.has(cacheKey)) {
                return chatCache.messages.get(cacheKey);
            }
            // Return mock data in development if API fails
            if (__DEV__) {
                console.log('Using mock messages due to API error');
                return mockChatService.getRoomMessages(roomId);
            }
            return [];
        }
    },


    // Search messages with debouncing handled by the component
    searchMessages: async (query, roomId = null) => {
        try {
            const params = { q: query };
            if (roomId) {
                params.roomId = roomId;
            }
            
            const response = await apiClient.get('/chat/search', { params });
            return response;
        } catch (error) {
            console.error('Error searching messages:', error);
            return [];
        }
    },

    // Mark messages as read
    markMessagesAsRead: async (roomId, messageIds = null) => {
        try {
            const data = messageIds ? { messageIds } : {};
            const response = await apiClient.post(`/chat/rooms/${roomId}/read`, data);
            
            // Clear message cache for this room as read status changed
            for (const [key] of chatCache.messages) {
                if (key.startsWith(roomId)) {
                    chatCache.messages.delete(key);
                    chatCache.messagesTimestamp.delete(key);
                }
            }
            
            return response;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    // Send a message (handled via socket, this is for fallback/offline support)
    sendMessage: async (roomId, content, type = 'text', attachments = []) => {
        try {
            const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
                content,
                type,
                attachments
            });
            
            // Clear message cache for this room
            for (const [key] of chatCache.messages) {
                if (key.startsWith(roomId)) {
                    chatCache.messages.delete(key);
                    chatCache.messagesTimestamp.delete(key);
                }
            }
            
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Delete a message
    deleteMessage: async (messageId) => {
        try {
            const response = await apiClient.delete(`/chat/messages/${messageId}`);
            
            // Clear all message caches as we don't know which room it belongs to
            chatCache.messages.clear();
            chatCache.messagesTimestamp.clear();
            
            return response;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    // Clear cache for a specific room
    clearRoomCache: (roomId) => {
        for (const [key] of chatCache.messages) {
            if (key.startsWith(roomId)) {
                chatCache.messages.delete(key);
                chatCache.messagesTimestamp.delete(key);
            }
        }
    },

    // Clear all cache
    clearAllCache: () => {
        chatCache.rooms = null;
        chatCache.roomsTimestamp = null;
        chatCache.messages.clear();
        chatCache.messagesTimestamp.clear();
    },

    // Get unread message count
    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/chat/unread-count');
            return response.count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    // Get room participants
    getRoomParticipants: async (roomId) => {
        try {
            const response = await apiClient.get(`/chat/rooms/${roomId}/participants`);
            return response;
        } catch (error) {
            console.error('Error fetching room participants:', error);
            return [];
        }
    }
};

export default chatService;