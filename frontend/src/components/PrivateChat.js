// Private Chat Feature with Real-time Messaging

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, User } from 'lucide-react';

const PrivateChat = ({ currentUser, recipient, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSocket = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    chatSocket.current = new WebSocket(`ws://localhost:8080/chat/${currentUser.id}/${recipient.id}`);
    
    chatSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      }
    };

    // Load chat history
    loadChatHistory();

    return () => {
      chatSocket.current?.close();
    };
  }, [currentUser.id, recipient.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/messages/${currentUser.id}/${recipient.id}`);
      const history = await response.json();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      recipientId: recipient.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Send via WebSocket
    chatSocket.current.send(JSON.stringify({
      type: 'message',
      message
    }));

    // Update local state
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Save to database
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleTyping = (isTyping) => {
    chatSocket.current.send(JSON.stringify({
      type: 'typing',
      isTyping
    }));
  };

  return (
    <div className="private-chat-container">
      <div className="chat-header">
        <div className="recipient-info">
          <User size={24} />
          <span>{recipient.name}</span>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}
          >
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span>{recipient.name} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-btn">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// Private Chat Manager Component
export const PrivateChatManager = ({ currentUser }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Connect to presence service
    const presenceSocket = new WebSocket('ws://localhost:8080/presence');
    
    presenceSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOnlineUsers(data.onlineUsers);
    };

    return () => {
      presenceSocket.close();
    };
  }, []);

  const startChat = (recipient) => {
    if (!activeChats.find(chat => chat.id === recipient.id)) {
      setActiveChats(prev => [...prev, recipient]);
    }
  };

  const closeChat = (recipientId) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== recipientId));
  };

  return (
    <div className="private-chat-manager">
      <div className="online-users-list">
        <h3>Online Users</h3>
        {onlineUsers.map(user => (
          <div key={user.id} className="user-item" onClick={() => startChat(user)}>
            <div className="user-status online" />
            <span>{user.name}</span>
            <MessageCircle size={16} />
          </div>
        ))}
      </div>

      <div className="active-chats">
        {activeChats.map(recipient => (
          <PrivateChat
            key={recipient.id}
            currentUser={currentUser}
            recipient={recipient}
            onClose={() => closeChat(recipient.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Notification System for Private Messages
export const MessageNotification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationSocket = new WebSocket(`ws://localhost:8080/notifications/${userId}`);
    
    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        setUnreadCount(prev => prev + 1);
        setNotifications(prev => [...prev, data.notification]);
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${data.senderName}`, {
            body: data.preview,
            icon: '/message-icon.png'
          });
        }
      }
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      notificationSocket.close();
    };
  }, [userId]);

  return (
    <div className="message-notifications">
      {unreadCount > 0 && (
        <div className="notification-badge">{unreadCount}</div>
      )}
    </div>
  );
};