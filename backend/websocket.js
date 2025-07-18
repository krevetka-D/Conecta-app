// server/websocket.js
const socketIO = require('socket.io');

function setupWebSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Handle private messages
    socket.on('private_message', (data) => {
      io.to(`user_${data.recipientId}`).emit('new_message', data);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`user_${data.recipientId}`).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = setupWebSocket;