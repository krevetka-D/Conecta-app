import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

import apiClient from '../../services/api/client';
import budgetService from '../../services/budgetService';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import socketEventManager from '../../utils/socketEventManager';
import { devLog } from '../../utils/devLog';

const RealtimeTestComponent = ({ roomId }) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [events, setEvents] = useState([]);
    const [testResults, setTestResults] = useState({});

    useEffect(() => {
        // Monitor connection
        const checkConnection = () => {
            const status = {
                connected: socketService.isConnected(),
                authenticated: socketService.isAuthenticated,
                socketId: socketService.getSocketId(),
                state: socketService.getConnectionState(),
            };
            setConnectionStatus(JSON.stringify(status, null, 2));
        };

        checkConnection();
        const interval = setInterval(checkConnection, 1000);

        // Listen for events
        const eventTypes = ['budget_update', 'new_message', 'checklist_update', 'event_update'];
        const unsubscribes = [];

        eventTypes.forEach(eventType => {
            const unsubscribe = socketEventManager.on(eventType, (data) => {
                devLog('RealtimeTest', `Received ${eventType}:`, data);
                setEvents(prev => [{
                    type: eventType,
                    data,
                    timestamp: new Date().toISOString(),
                }, ...prev].slice(0, 10));
            });
            unsubscribes.push(unsubscribe);
        });

        return () => {
            clearInterval(interval);
            unsubscribes.forEach(unsub => unsub());
        };
    }, []);

    const testBudgetUpdate = async () => {
        try {
            setTestResults(prev => ({ ...prev, budget: 'Testing...' }));
            
            // Create a test budget entry
            const entry = await budgetService.createBudgetEntry({
                type: 'EXPENSE',
                category: 'Test Category',
                amount: 100,
                description: 'Real-time test entry',
                entryDate: new Date(),
            });

            setTestResults(prev => ({ ...prev, budget: 'Created entry, waiting for event...' }));

            // Wait for event
            setTimeout(() => {
                const hasEvent = events.some(e => e.type === 'budget_update');
                setTestResults(prev => ({ 
                    ...prev, 
                    budget: hasEvent ? '✅ Success' : '❌ No event received' 
                }));
            }, 3000);

        } catch (error) {
            setTestResults(prev => ({ ...prev, budget: `❌ Error: ${error.message}` }));
        }
    };

    const testChatMessage = async () => {
        if (!roomId) {
            setTestResults(prev => ({ ...prev, chat: '❌ No roomId provided' }));
            return;
        }

        try {
            setTestResults(prev => ({ ...prev, chat: 'Testing...' }));
            
            // Send a test message
            await chatService.sendMessage(roomId, 'Real-time test message');

            setTestResults(prev => ({ ...prev, chat: 'Sent message, waiting for event...' }));

            // Wait for event
            setTimeout(() => {
                const hasEvent = events.some(e => e.type === 'new_message');
                setTestResults(prev => ({ 
                    ...prev, 
                    chat: hasEvent ? '✅ Success' : '❌ No event received' 
                }));
            }, 3000);

        } catch (error) {
            setTestResults(prev => ({ ...prev, chat: `❌ Error: ${error.message}` }));
        }
    };

    const clearCache = () => {
        apiClient.clearAllCache();
        setTestResults(prev => ({ ...prev, cache: '✅ Cache cleared' }));
        setTimeout(() => {
            setTestResults(prev => ({ ...prev, cache: '' }));
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Real-time Debug Panel</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connection Status:</Text>
                <Text style={styles.code}>{connectionStatus}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Test Actions:</Text>
                
                <TouchableOpacity style={styles.button} onPress={testBudgetUpdate}>
                    <Text style={styles.buttonText}>Test Budget Update</Text>
                </TouchableOpacity>
                {testResults.budget && <Text style={styles.result}>{testResults.budget}</Text>}

                <TouchableOpacity style={styles.button} onPress={testChatMessage}>
                    <Text style={styles.buttonText}>Test Chat Message</Text>
                </TouchableOpacity>
                {testResults.chat && <Text style={styles.result}>{testResults.chat}</Text>}

                <TouchableOpacity style={styles.button} onPress={clearCache}>
                    <Text style={styles.buttonText}>Clear API Cache</Text>
                </TouchableOpacity>
                {testResults.cache && <Text style={styles.result}>{testResults.cache}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Events:</Text>
                <ScrollView style={styles.eventList}>
                    {events.length === 0 ? (
                        <Text style={styles.noEvents}>No events yet</Text>
                    ) : (
                        events.map((event, index) => (
                            <View key={index} style={styles.event}>
                                <Text style={styles.eventType}>{event.type}</Text>
                                <Text style={styles.eventTime}>
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </Text>
                                <Text style={styles.eventData}>
                                    {JSON.stringify(event.data, null, 2).substring(0, 100)}...
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        margin: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    code: {
        fontFamily: 'monospace',
        fontSize: 12,
        backgroundColor: '#e0e0e0',
        padding: 8,
        borderRadius: 4,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 6,
        marginVertical: 4,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
    },
    result: {
        marginTop: 4,
        marginBottom: 8,
        fontSize: 14,
        fontStyle: 'italic',
    },
    eventList: {
        maxHeight: 200,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        padding: 8,
    },
    event: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    eventType: {
        fontWeight: '600',
        fontSize: 14,
    },
    eventTime: {
        fontSize: 12,
        color: '#666',
    },
    eventData: {
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#444',
    },
    noEvents: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
    },
});

export default RealtimeTestComponent;