/**
 * Debug middleware for socket emissions
 */

export function debugSocketEmission(io) {
    // Intercept all emissions
    const originalEmit = io.emit;
    const originalTo = io.to;
    const originalIn = io.in;
    
    // Override io.emit
    io.emit = function(eventName, ...args) {
        console.log(`🔵 [Socket.IO] Global emit: ${eventName}`, {
            event: eventName,
            data: args[0],
            timestamp: new Date().toISOString()
        });
        return originalEmit.apply(this, [eventName, ...args]);
    };
    
    // Override io.to and io.in to track room emissions
    const createRoomEmitter = (original, type) => {
        return function(room) {
            const emitter = original.call(this, room);
            const originalRoomEmit = emitter.emit;
            
            emitter.emit = function(eventName, ...args) {
                console.log(`🟢 [Socket.IO] ${type}('${room}').emit: ${eventName}`, {
                    room,
                    event: eventName,
                    data: args[0],
                    timestamp: new Date().toISOString()
                });
                return originalRoomEmit.apply(this, [eventName, ...args]);
            };
            
            return emitter;
        };
    };
    
    io.to = createRoomEmitter(originalTo, 'to');
    io.in = createRoomEmitter(originalIn, 'in');
    
    // Also track individual socket emissions
    io.on('connection', (socket) => {
        const originalSocketEmit = socket.emit;
        
        socket.emit = function(eventName, ...args) {
            console.log(`🟡 [Socket] ${socket.id} emit: ${eventName}`, {
                socketId: socket.id,
                userId: socket.userId,
                event: eventName,
                data: args[0],
                timestamp: new Date().toISOString()
            });
            return originalSocketEmit.apply(this, [eventName, ...args]);
        };
    });
    
    console.log('✅ Socket emission debugging enabled');
}

export default debugSocketEmission;