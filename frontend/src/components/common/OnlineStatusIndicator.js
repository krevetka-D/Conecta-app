// frontend/src/components/common/OnlineStatusIndicator.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import socketService from '../../services/socketService';
import { colors } from '../../constants/theme';

export const OnlineStatusIndicator = ({ userId, showText = false, size = 12 }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);

    useEffect(() => {
        if (!userId) return;

        // Subscribe to status updates
        const unsubscribe = socketService.subscribeToUserStatus(userId, (data) => {
            setIsOnline(data.isOnline);
            setLastSeen(data.lastSeen);
        });

        return unsubscribe;
    }, [userId]);

    const formatLastSeen = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const seen = new Date(date);
        const diffMinutes = Math.floor((now - seen) / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    return (
        <View style={styles.container}>
            <View style={[
                styles.indicator,
                { 
                    width: size, 
                    height: size,
                    backgroundColor: isOnline ? colors.success : colors.textSecondary 
                }
            ]} />
            {showText && (
                <Text style={styles.text}>
                    {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicator: {
        borderRadius: 50,
        marginRight: 4,
    },
    text: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});