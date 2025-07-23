
import { Server } from 'socket.io';

let io = null;

export function initializeWebSocket(server, corsOptions) {
  if (io) {
    console.warn('WebSocket already initialized');
    return io;
  }

  io = new Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 1e6,
    path: '/socket.io/',
    allowEIO3: true,
    perMessageDeflate: {
      threshold: 1024,
      zlibDeflateOptions: {
        chunkSize: 16 * 1024,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
    }
  });

  console.log('🔌 WebSocket server initialized');
  return io;
}

export function getIO() {
  if (!io) {
    console.error('WebSocket not initialized! Call initializeWebSocket first.');
  }
  return io;
}

export function emitToUser(userId, event, data) {
  const ioInstance = getIO();
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
}

export function emitToAll(event, data) {
  const ioInstance = getIO();
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

export function emitToRoom(roomId, event, data) {
  const ioInstance = getIO();
  if (ioInstance) {
    ioInstance.to(roomId).emit(event, data);
  }
}