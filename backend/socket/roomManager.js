/**
 * Room Manager - Handles socket room management
 */

const roomMembers = new Map(); // roomId -> Set of socket IDs

/**
 * Add a socket to a room
 * @param {Object} socket - Socket instance
 * @param {string} roomId - Room ID
 * @returns {boolean} Success status
 */
export function joinRoom(socket, roomId) {
    if (!socket || !roomId) return false;
    
    const roomName = `room_${roomId}`;
    
    // Join socket.io room
    socket.join(roomName);
    
    // Track in our map
    if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
    }
    roomMembers.get(roomId).add(socket.id);
    
    // Store room info on socket
    if (!socket.rooms) socket.rooms = new Set();
    socket.rooms.add(roomId);
    
    console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
    console.log(`   Room ${roomId} now has ${roomMembers.get(roomId).size} members`);
    
    return true;
}

/**
 * Remove a socket from a room
 * @param {Object} socket - Socket instance
 * @param {string} roomId - Room ID
 * @returns {boolean} Success status
 */
export function leaveRoom(socket, roomId) {
    if (!socket || !roomId) return false;
    
    const roomName = `room_${roomId}`;
    
    // Leave socket.io room
    socket.leave(roomName);
    
    // Remove from our map
    if (roomMembers.has(roomId)) {
        roomMembers.get(roomId).delete(socket.id);
        if (roomMembers.get(roomId).size === 0) {
            roomMembers.delete(roomId);
        }
    }
    
    // Remove from socket rooms
    if (socket.rooms) {
        socket.rooms.delete(roomId);
    }
    
    console.log(`Socket ${socket.id} left room ${roomId}`);
    
    return true;
}

/**
 * Remove socket from all rooms
 * @param {Object} socket - Socket instance
 */
export function leaveAllRooms(socket) {
    if (!socket) return;
    
    // Leave all tracked rooms
    if (socket.rooms) {
        socket.rooms.forEach(roomId => {
            leaveRoom(socket, roomId);
        });
    }
    
    // Also check our map for any missed rooms
    roomMembers.forEach((members, roomId) => {
        if (members.has(socket.id)) {
            members.delete(socket.id);
            if (members.size === 0) {
                roomMembers.delete(roomId);
            }
        }
    });
}

/**
 * Get members in a room
 * @param {string} roomId - Room ID
 * @returns {Set} Set of socket IDs
 */
export function getRoomMembers(roomId) {
    return roomMembers.get(roomId) || new Set();
}

/**
 * Check if socket is in room
 * @param {Object} socket - Socket instance
 * @param {string} roomId - Room ID
 * @returns {boolean} Is in room
 */
export function isInRoom(socket, roomId) {
    if (!socket || !roomId) return false;
    return socket.rooms?.has(roomId) || false;
}

/**
 * Get all rooms for a socket
 * @param {Object} socket - Socket instance
 * @returns {Set} Set of room IDs
 */
export function getSocketRooms(socket) {
    return socket.rooms || new Set();
}

/**
 * Clean up empty rooms
 */
export function cleanupEmptyRooms() {
    const emptyRooms = [];
    roomMembers.forEach((members, roomId) => {
        if (members.size === 0) {
            emptyRooms.push(roomId);
        }
    });
    
    emptyRooms.forEach(roomId => {
        roomMembers.delete(roomId);
    });
    
    if (emptyRooms.length > 0) {
        console.log(`Cleaned up ${emptyRooms.length} empty rooms`);
    }
}

// Run cleanup periodically
setInterval(cleanupEmptyRooms, 300000); // Every 5 minutes

export default {
    joinRoom,
    leaveRoom,
    leaveAllRooms,
    getRoomMembers,
    isInRoom,
    getSocketRooms,
    cleanupEmptyRooms
};