
import io from 'socket.io-client';
import { API_BASE_URL } from './api/endpoints';

class WebSocketService {
    constructor() {
        this.socket = null;
    }
    
    connect(userId) {
        this.socket = io(API_BASE_URL, {
            query: { userId }
        });
        
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });
        
        return this.socket;
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
    
    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
    
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }
    
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export default new WebSocketService();