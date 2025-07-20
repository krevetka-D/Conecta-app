// Mock chat service for development when backend is not available
const mockMessages = new Map();
const mockRooms = [
    {
        _id: '1',
        title: 'General Discussion',
        description: 'Talk about anything related to living in Alicante',
        lastMessage: {
            content: 'Welcome to the general discussion!',
            sender: { name: 'System' },
            createdAt: new Date().toISOString()
        },
        onlineCount: 5,
        unreadCount: 0
    },
    {
        _id: '2',
        title: 'Freelancer Tips',
        description: 'Share tips and experiences as a freelancer',
        lastMessage: null,
        onlineCount: 3,
        unreadCount: 0
    }
];

// Initialize with some default messages
mockMessages.set('1', [
    {
        _id: 'msg1',
        content: 'Welcome to the general discussion room!',
        sender: {
            _id: 'system',
            name: 'System'
        },
        roomId: '1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
    }
]);

export const mockChatService = {
    // Get chat rooms
    getRooms: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return mockRooms;
    },

    // Get messages for a room
    getRoomMessages: async (roomId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockMessages.get(roomId) || [];
    },

    // Send a message (mock)
    sendMessage: async (roomId, content, userId = 'current-user', userName = 'You') => {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const newMessage = {
            _id: `msg_${Date.now()}`,
            content,
            sender: {
                _id: userId,
                name: userName
            },
            roomId,
            createdAt: new Date().toISOString(),
            type: 'text'
        };

        // Add to mock storage
        const roomMessages = mockMessages.get(roomId) || [];
        roomMessages.push(newMessage);
        mockMessages.set(roomId, roomMessages);

        // Update last message in room
        const room = mockRooms.find(r => r._id === roomId);
        if (room) {
            room.lastMessage = {
                content,
                sender: { name: userName },
                createdAt: newMessage.createdAt
            };
        }

        return newMessage;
    },

    // Join a room (mock)
    joinRoom: async (roomId) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    },

    // Leave a room (mock)
    leaveRoom: async (roomId) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    }
};

export default mockChatService;