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
        lastMessage: {
            content: 'Great tips on getting your NIE!',
            sender: { name: 'Alex' },
            createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        onlineCount: 3,
        unreadCount: 2
    },
    {
        _id: '3',
        title: 'Entrepreneur Network',
        description: 'Connect with other entrepreneurs in Alicante',
        lastMessage: null,
        onlineCount: 8,
        unreadCount: 0
    }
];

// Initialize with some default messages
mockMessages.set('1', [
    {
        _id: 'msg1',
        content: 'Welcome to the general discussion group!',
        sender: {
            _id: 'system',
            name: 'System'
        },
        roomId: '1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
    },
    {
        _id: 'msg2',
        content: 'Hey everyone! Just moved to Alicante from London. Any tips for a new freelancer?',
        sender: {
            _id: 'user1',
            name: 'Sarah'
        },
        roomId: '1',
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        type: 'text'
    },
    {
        _id: 'msg3',
        content: 'Welcome Sarah! First thing - get your NIE sorted. You\'ll need it for everything.',
        sender: {
            _id: 'user2',
            name: 'Miguel'
        },
        roomId: '1',
        createdAt: new Date(Date.now() - 2400000).toISOString(),
        type: 'text'
    },
    {
        _id: 'msg4',
        content: 'Also, join the local coworking spaces. Great way to network!',
        sender: {
            _id: 'user3',
            name: 'Emma'
        },
        roomId: '1',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        type: 'text'
    }
]);

mockMessages.set('2', [
    {
        _id: 'msg10',
        content: 'Has anyone here gone through the autonomo registration process recently?',
        sender: {
            _id: 'user4',
            name: 'John'
        },
        roomId: '2',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        type: 'text'
    },
    {
        _id: 'msg11',
        content: 'Yes! Just did it last month. Happy to share my experience.',
        sender: {
            _id: 'user5',
            name: 'Ana'
        },
        roomId: '2',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        type: 'text'
    }
]);

export const mockChatService = {
    // Get chat groups
    getRooms: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return mockRooms;
    },

    // Get messages for a group
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

        // Update last message in group
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

    // Join a group (mock)
    joinRoom: async (roomId) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    },

    // Leave a group (mock)
    leaveRoom: async (roomId) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    }
};

export default mockChatService;