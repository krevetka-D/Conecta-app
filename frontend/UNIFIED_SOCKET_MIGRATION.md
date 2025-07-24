# Unified Socket Service Migration Guide

## Overview
All socket functionality has been consolidated into a single `unifiedSocketService.js` file, replacing multiple socket service implementations.

## Migration Complete ✅

### Files Updated:
- All imports of `socketServiceFixed` → `socketService`
- All socket functionality consolidated into `unifiedSocketService.js`
- `socketService.js` now redirects to `unifiedSocketService.js` for backward compatibility

### Files Deleted:
- `socketServiceFixed.js` - Merged into unified service
- `socketService.original.js` - Obsolete backup
- `socketServiceSimplified.js` - Debug version no longer needed
- `testSocketConnection.js` - Test utility
- `testDirectSocketConnection.js` - Test utility
- `socketConnectionFix.js` - Fix utility

### Remaining Socket Files:
1. **Services:**
   - `unifiedSocketService.js` - Main implementation
   - `socketService.js` - Compatibility wrapper

2. **Event Management:**
   - `socketEventManager.js` - Centralized event handling
   - `optimizedSocketManager.js` - Room management utility

3. **Hooks:**
   - `useSocketEvents.js` - Generic socket hook
   - `useChatSocketEvents.js` - Chat-specific hook

4. **Utilities:**
   - `chatSocketFix.js` - Chat connection helper
   - `realtimeMessageFix.js` - Message listener setup
   - `socketDebugger.js` - Debug utility
   - `socketConnectionManager.js` - Connection monitoring

5. **Hybrid Services:**
   - `realtimeService.js` - WebSocket + polling hybrid
   - `pollingService.js` - HTTP polling fallback

## Unified Socket Service Features

### Core Functionality:
- **Connection Management**: Connect, disconnect, reconnect
- **Authentication**: JWT-based auth with automatic re-auth
- **Event Handling**: On, off, once, emit with local events
- **Room Management**: Join, leave, check membership
- **Chat Features**: Messages, typing indicators
- **Debug Support**: Comprehensive debug logging

### Key Methods:
```javascript
// Connection
await socketService.connect(userId);
socketService.disconnect();
await socketService.forceReconnect();

// Events
socketService.on(event, callback);
socketService.off(event, callback);
socketService.emit(event, data);

// Local Events (non-socket)
socketService.addLocalListener(event, callback);
socketService.removeLocalListener(event, callback);
socketService.emitLocal(event, data);

// Rooms
socketService.joinRoom(roomId);
socketService.leaveRoom(roomId);
socketService.isInRoom(roomId);

// Chat
socketService.sendMessage(data);
socketService.sendPersonalMessage(data);
socketService.typing(roomId, isTyping);

// Status
socketService.isConnected();
socketService.isAuthed();
socketService.getConnectionState();
socketService.getDebugInfo();
```

### Automatic Features:
- Platform-specific URL handling (Android/iOS localhost)
- WebSocket transport with polling fallback
- Automatic reconnection with exponential backoff
- Event re-registration after reconnection
- Room re-joining after reconnection
- Cache invalidation on socket events

## Usage Examples

### Basic Connection:
```javascript
import socketService from './services/socketService';

// Connect
await socketService.connect(userId);

// Listen for events
socketService.on('new_message', (message) => {
  console.log('New message:', message);
});

// Join a room
socketService.joinRoom(roomId);

// Send a message
socketService.sendMessage({ roomId, content: 'Hello!' });
```

### With Hooks:
```javascript
import { useSocketEvents } from './hooks/useSocketEvents';

// In component
useSocketEvents({
  'new_message': handleNewMessage,
  'user_typing': handleTyping
}, [roomId]);
```

### Debug Mode:
```javascript
// Enable debug logging
socketService.enableDebug();

// Get debug info
const info = socketService.getDebugInfo();
console.log(info);
```

## Benefits of Unification

1. **Single Source of Truth**: All socket logic in one place
2. **Consistent API**: Same methods across the app
3. **Better Maintenance**: Easier to debug and update
4. **Reduced Complexity**: No more multiple implementations
5. **Improved Performance**: Optimized reconnection logic
6. **Enhanced Reliability**: Comprehensive error handling

## Future Enhancements

1. **TypeScript Support**: Add type definitions
2. **React Native Optimization**: Better background handling
3. **Offline Queue**: Store events when disconnected
4. **Metrics Collection**: Connection quality tracking
5. **Plugin System**: Extensible architecture