import apiClient from '../services/api/client';
import { devLog } from './devLog';

/**
 * Centralized real-time update handler for cache invalidation
 */
export const realtimeUpdateHandlers = {
    // Budget updates
    handleBudgetUpdate: (data) => {
        devLog('RealtimeUpdates', 'Budget update received', data);
        // Clear all budget-related caches
        apiClient.clearCache('/budget');
        apiClient.clearCache('/budget/summary');
        return data;
    },

    // Checklist updates
    handleChecklistUpdate: (data) => {
        devLog('RealtimeUpdates', 'Checklist update received', data);
        // Clear checklist cache
        apiClient.clearCache('/checklist');
        return data;
    },

    // Event updates
    handleEventUpdate: (data) => {
        devLog('RealtimeUpdates', 'Event update received', data);
        // Clear event-related caches
        apiClient.clearCache('/events');
        if (data.event?._id) {
            apiClient.clearCache(`/events/${data.event._id}`);
        }
        return data;
    },

    // Forum updates
    handleForumUpdate: (data) => {
        devLog('RealtimeUpdates', 'Forum update received', data);
        // Clear forum caches
        apiClient.clearCache('/forums');
        if (data.forum?._id) {
            apiClient.clearCache(`/forums/${data.forum._id}`);
        }
        return data;
    },

    // Message updates
    handleMessageUpdate: (data) => {
        devLog('RealtimeUpdates', 'Message update received', data);
        // Clear message-related caches
        apiClient.clearCache('/messages');
        apiClient.clearCache('/messages/conversations');
        if (data.roomId) {
            apiClient.clearCache(`/chat/rooms/${data.roomId}/messages`);
        }
        return data;
    },

    // Clear all caches when connection is re-established
    handleReconnect: () => {
        devLog('RealtimeUpdates', 'Socket reconnected, clearing all caches');
        apiClient.clearAllCache();
    }
};

/**
 * Hook to setup real-time updates with cache invalidation
 */
export const useRealtimeUpdates = (handlers = {}) => {
    // Combine default handlers with custom ones
    const allHandlers = {
        budget_update: (data) => {
            realtimeUpdateHandlers.handleBudgetUpdate(data);
            handlers.budget_update?.(data);
        },
        checklist_update: (data) => {
            realtimeUpdateHandlers.handleChecklistUpdate(data);
            handlers.checklist_update?.(data);
        },
        event_update: (data) => {
            realtimeUpdateHandlers.handleEventUpdate(data);
            handlers.event_update?.(data);
        },
        forum_update: (data) => {
            realtimeUpdateHandlers.handleForumUpdate(data);
            handlers.forum_update?.(data);
        },
        new_message: (data) => {
            realtimeUpdateHandlers.handleMessageUpdate(data);
            handlers.new_message?.(data);
        },
        authenticated: () => {
            realtimeUpdateHandlers.handleReconnect();
            handlers.authenticated?.();
        }
    };

    return allHandlers;
};