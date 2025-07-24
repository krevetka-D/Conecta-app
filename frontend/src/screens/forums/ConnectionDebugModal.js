import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Modal, Button } from 'react-native-paper';

import Icon from '../../components/common/Icon';
import { colors } from '../../constants/theme';
import realtimeService from '../../services/realtimeService';
import socketService from '../../services/socketService';
import socketConnectionManager from '../../utils/socketConnectionManager';
import { testDirectSocketConnection, testHttpConnection } from '../../utils/connectionTest';

const ConnectionDebugModal = ({ visible, onDismiss, userId }) => {
    const [status, setStatus] = useState({});
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (visible) {
            checkStatus();
            const interval = setInterval(checkStatus, 1000);
            return () => clearInterval(interval);
        }
    }, [visible]);

    const checkStatus = () => {
        const socketStatus = socketConnectionManager.getStatus();
        const realtimeStatus = realtimeService.getStatus();
        const now = new Date().toLocaleTimeString();
        
        setStatus({
            ...socketStatus,
            timestamp: now,
            socketServiceConnected: socketService.socket?.connected || false,
            socketServiceAuth: socketService.isAuthenticated || false,
            realtimeMode: realtimeStatus.mode,
            realtimeConnected: realtimeStatus.connected,
            realtimeDetails: realtimeStatus.details,
        });
    };

    const forceReconnect = async () => {
        addLog('Forcing reconnection...');
        await socketConnectionManager.forceReconnect();
        checkStatus();
        addLog('Reconnection attempt completed');
    };

    const testConnection = async () => {
        addLog('Starting connection test...');
        
        // Test 1: HTTP Connection
        addLog('Testing HTTP connection...');
        const httpOk = await testHttpConnection();
        if (httpOk) {
            addLog('✅ HTTP connection successful');
        } else {
            addLog('❌ HTTP connection failed - check backend URL');
        }
        
        // Test 2: Check socket instance
        if (!socketService.socket) {
            addLog('❌ No socket instance found');
        } else {
            addLog('✅ Socket instance exists');
        }

        // Test 3: Check connection state
        addLog(`Connection state: ${socketService.getConnectionState()}`);
        
        // Test 4: Try to connect
        if (userId) {
            addLog('Attempting to connect...');
            try {
                await socketService.connect(userId);
                addLog('✅ Connection attempt completed');
            } catch (error) {
                addLog(`❌ Connection error: ${error.message}`);
            }
        }

        // Test 5: Check authentication
        if (socketService.isConnected()) {
            addLog('✅ Socket is connected and authenticated');
        } else {
            addLog('❌ Socket is not fully connected');
        }
        
        // Test 6: Direct socket test
        addLog('Running direct socket test...');
        await testDirectSocketConnection();

        checkStatus();
    };

    const addLog = (message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={{
                backgroundColor: 'white',
                padding: 20,
                margin: 20,
                borderRadius: 8,
                maxHeight: '80%',
            }}
        >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
                Socket Connection Debug
            </Text>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Current Status:</Text>
                <View style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                    <StatusRow label="Mode" value={status.realtimeMode || 'none'} text />
                    <StatusRow label="Connected" value={status.realtimeConnected} />
                    <StatusRow label="WebSocket Auth" value={status.isAuthenticated} />
                    <StatusRow label="Connection State" value={status.connectionState} text />
                    <StatusRow label="Socket ID" value={status.socketId || 'None'} text />
                    <StatusRow label="Monitoring" value={status.isMonitoring} />
                    <StatusRow label="Attempts" value={status.attempts} text />
                    <StatusRow label="Last Update" value={status.timestamp} text />
                    {status.realtimeMode === 'polling' && (
                        <Text style={{ marginTop: 10, fontSize: 12, color: colors.info }}>
                            📊 Using HTTP polling (WebSocket unavailable)
                        </Text>
                    )}
                </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                <Button 
                    mode="contained" 
                    onPress={testConnection}
                    style={{ margin: 5 }}
                    compact
                >
                    Test Connection
                </Button>
                <Button 
                    mode="contained" 
                    onPress={forceReconnect}
                    style={{ margin: 5 }}
                    compact
                >
                    Force Reconnect
                </Button>
                <Button 
                    mode="outlined" 
                    onPress={clearLogs}
                    style={{ margin: 5 }}
                    compact
                >
                    Clear Logs
                </Button>
                <Button 
                    mode="outlined" 
                    onPress={() => {
                        socketConnectionManager.connectionAttempts = 0;
                        addLog('Reset connection attempts counter');
                        checkStatus();
                    }}
                    style={{ margin: 5 }}
                    compact
                >
                    Reset Counter
                </Button>
            </View>

            <ScrollView style={{ maxHeight: 200, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                {logs.map((log, index) => (
                    <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
                        {log}
                    </Text>
                ))}
                {logs.length === 0 && (
                    <Text style={{ fontSize: 12, color: '#666' }}>
                        No logs yet. Press "Test Connection" to start.
                    </Text>
                )}
            </ScrollView>

            <Button 
                mode="contained" 
                onPress={onDismiss}
                style={{ marginTop: 20 }}
            >
                Close
            </Button>
        </Modal>
    );
};

const StatusRow = ({ label, value, text = false }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text>{label}:</Text>
        {text ? (
            <Text style={{ fontWeight: 'bold' }}>{value}</Text>
        ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon 
                    name={value ? 'check-circle' : 'close-circle'} 
                    size={16} 
                    color={value ? colors.success : colors.error} 
                />
                <Text style={{ marginLeft: 5 }}>{value ? 'Yes' : 'No'}</Text>
            </View>
        )}
    </View>
);

export default ConnectionDebugModal;