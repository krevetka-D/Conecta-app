import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

import socketServiceSimplified from '../../services/socketServiceSimplified';
import { devLog } from '../../utils';

const SocketDebugComponent = () => {
    const [logs, setLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    
    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toISOString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
        devLog('SocketDebug', message);
    };
    
    useEffect(() => {
        // Override console methods to capture logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog(...args);
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            if (message.includes('Socket')) {
                addLog(message, 'info');
            }
        };
        
        console.error = (...args) => {
            originalError(...args);
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            if (message.includes('Socket')) {
                addLog(message, 'error');
            }
        };
        
        console.warn = (...args) => {
            originalWarn(...args);
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            if (message.includes('Socket')) {
                addLog(message, 'warn');
            }
        };
        
        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);
    
    const testConnection = async () => {
        addLog('Starting connection test...', 'info');
        setLogs([]); // Clear previous logs
        
        try {
            // Test user ID
            const testUserId = 'test-user-' + Date.now();
            
            addLog(`Attempting to connect with userId: ${testUserId}`, 'info');
            
            await socketServiceSimplified.connect(testUserId);
            
            // Check connection status
            const connected = socketServiceSimplified.isConnected();
            setIsConnected(connected);
            
            if (connected) {
                addLog('✅ Socket connected successfully!', 'success');
                
                // Try to emit a test event
                socketServiceSimplified.emit('test_event', { message: 'Hello from debug!' });
                addLog('Emitted test event', 'info');
            } else {
                addLog('❌ Socket failed to connect', 'error');
            }
        } catch (error) {
            addLog(`Error during connection: ${error.message}`, 'error');
        }
    };
    
    const disconnect = () => {
        socketServiceSimplified.disconnect();
        setIsConnected(false);
        addLog('Disconnected socket', 'info');
    };
    
    const getLogColor = (type) => {
        switch (type) {
            case 'error': return '#ff4444';
            case 'warn': return '#ff9944';
            case 'success': return '#44ff44';
            default: return '#ffffff';
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Socket.IO Debug Panel</Text>
            
            <View style={styles.status}>
                <Text style={styles.statusText}>
                    Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </Text>
            </View>
            
            <View style={styles.buttons}>
                <Button 
                    title="Test Connection" 
                    onPress={testConnection}
                    disabled={isConnected}
                />
                <Button 
                    title="Disconnect" 
                    onPress={disconnect}
                    disabled={!isConnected}
                />
                <Button 
                    title="Clear Logs" 
                    onPress={() => setLogs([])}
                />
            </View>
            
            <ScrollView style={styles.logContainer}>
                {logs.map((log, index) => (
                    <View key={index} style={styles.logEntry}>
                        <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
                            [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    status: {
        padding: 10,
        backgroundColor: '#2a2a2a',
        borderRadius: 5,
        marginBottom: 10,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 16,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    logContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderRadius: 5,
        padding: 5,
    },
    logEntry: {
        marginBottom: 5,
    },
    logText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
    },
});

export default SocketDebugComponent;