// Real-time event emitters for socket.io
import { getIO, emitToUser, emitToAll } from '../websocket.js';

// Emit real-time updates to specific users or all users
export const emitRealtimeUpdate = (event, data, userId = null) => {
    const io = getIO();
    if (!io) {
        console.error('Socket.IO instance not found - real-time update not sent:', event);
        return;
    }

    console.log(`📤 Emitting real-time event: ${event}`, { userId, dataType: data.type });

    if (userId) {
        // Emit to specific user's rooms
        emitToUser(userId, event, data);
    } else {
        // Emit to all connected clients
        emitToAll(event, data);
    }
};

// Checklist real-time events
export const emitChecklistUpdate = (userId, checklistItem) => {
    emitRealtimeUpdate('checklist_update', {
        type: 'update',
        item: checklistItem,
        timestamp: new Date()
    }, userId);
};

export const emitChecklistCreate = (userId, checklistItems) => {
    emitRealtimeUpdate('checklist_update', {
        type: 'create',
        items: checklistItems,
        timestamp: new Date()
    }, userId);
};

// Budget real-time events
export const emitBudgetCreate = (userId, budgetEntry) => {
    emitRealtimeUpdate('budget_update', {
        type: 'create',
        entry: budgetEntry,
        timestamp: new Date()
    }, userId);
};

export const emitBudgetUpdate = (userId, budgetEntry) => {
    emitRealtimeUpdate('budget_update', {
        type: 'update',
        entry: budgetEntry,
        timestamp: new Date()
    }, userId);
};

export const emitBudgetDelete = (userId, entryId) => {
    emitRealtimeUpdate('budget_update', {
        type: 'delete',
        entryId: entryId,
        timestamp: new Date()
    }, userId);
};

// Event real-time events
export const emitEventCreate = (event) => {
    emitRealtimeUpdate('event_update', {
        type: 'create',
        event: event,
        timestamp: new Date()
    });
};

export const emitEventUpdate = (event) => {
    emitRealtimeUpdate('event_update', {
        type: 'update',
        event: event,
        timestamp: new Date()
    });
};

export const emitEventDelete = (eventId) => {
    emitRealtimeUpdate('event_update', {
        type: 'delete',
        eventId: eventId,
        timestamp: new Date()
    });
};

export const emitEventRegistration = (eventId, userId, action) => {
    emitRealtimeUpdate('event_registration', {
        eventId: eventId,
        userId: userId,
        action: action, // 'register' or 'unregister'
        timestamp: new Date()
    });
};

// Forum/Group real-time events
export const emitForumCreate = (forum) => {
    emitRealtimeUpdate('forum_update', {
        type: 'create',
        forum: forum,
        timestamp: new Date()
    });
};

export const emitForumUpdate = (forum) => {
    emitRealtimeUpdate('forum_update', {
        type: 'update',
        forum: forum,
        timestamp: new Date()
    });
};

export const emitForumMessage = (forumId, message) => {
    emitRealtimeUpdate('forum_message', {
        forumId: forumId,
        message: message,
        timestamp: new Date()
    });
};

// Dashboard real-time updates
export const emitDashboardUpdate = (userId, updateType, data) => {
    emitRealtimeUpdate('dashboard_update', {
        updateType: updateType,
        data: data,
        timestamp: new Date()
    }, userId);
};

// Helper to join user-specific room
export const joinUserRoom = (socket, userId) => {
    socket.join(`user_${userId}`);
};

// Helper to leave user-specific room
export const leaveUserRoom = (socket, userId) => {
    socket.leave(`user_${userId}`);
};