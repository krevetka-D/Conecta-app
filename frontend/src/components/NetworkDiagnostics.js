import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import Constants from 'expo-constants';

const NetworkDiagnostics = ({ onRetry }) => {
    const [networkInfo, setNetworkInfo] = useState(null);
    
    useEffect(() => {
        checkNetwork();
    }, []);
    
    const checkNetwork = async () => {
        const networkState = await Network.getNetworkStateAsync();
        const ipAddress = await Network.getIpAddressAsync();
        
        setNetworkInfo({
            isConnected: networkState.isConnected,
            type: networkState.type,
            ipAddress,
            debuggerHost: Constants.manifest?.debuggerHost,
        });
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Network Configuration Error</Text>
            
            {networkInfo && (
                <View style={styles.info}>
                    <Text style={styles.label}>Connected: {networkInfo.isConnected ? 'Yes' : 'No'}</Text>
                    <Text style={styles.label}>Network Type: {networkInfo.type}</Text>
                    <Text style={styles.label}>Device IP: {networkInfo.ipAddress}</Text>
                    <Text style={styles.label}>Debug Host: {networkInfo.debuggerHost || 'Not available'}</Text>
                </View>
            )}
            
            <Text style={styles.instructions}>
                Please ensure:
                {'\n'}• Your device and computer are on the same WiFi network
                {'\n'}• Expo server is running (npm start)
                {'\n'}• You're using the correct IP address
            </Text>
            
            <Button title="Retry Connection" onPress={onRetry} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    info: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
    },
    instructions: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
        color: '#666',
    },
});

export default NetworkDiagnostics;