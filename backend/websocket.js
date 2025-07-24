
import { Server } from 'socket.io';

let io = null;

export function initializeWebSocket(server, corsOptions) {
  if (io) {
    console.warn('WebSocket already initialized');
    return io;
  }

  io = new Server(server, {
    cors: {
      ...corsOptions,
      // Allow all methods including POST for handshake
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    },
    transports: ['polling', 'websocket'], // Support both transports
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 10e6, // 10MB
    path: '/socket.io/',
    allowEIO3: true,
    perMessageDeflate: false, // Disable compression for React Native
    allowUpgrades: true, // Enable upgrades for better performance
    allowRequest: (req, callback) => {
      // Log all socket.io requests for debugging
      console.log('Socket.IO request:', {
        method: req.method,
        url: req.url,
        headers: {
          origin: req.headers.origin,
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      });
      
      // Always allow requests (CORS is handled by the cors option)
      callback(null, true);
    },
    // React Native compatibility options
    cookie: false, // Disable cookies
    httpCompression: false, // Disable HTTP compression
    serveClient: false, // Don't serve the client file
    // Additional options for polling transport
    upgradeTimeout: 10000,
    destroyUpgrade: false,
    destroyUpgradeTimeout: 1000
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