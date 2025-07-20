import React from 'react';
import { Platform, Text, View } from 'react-native';

// Safe icon component that handles missing vector icons
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
    // Try to load vector icons only on native platforms
    if (Platform.OS !== 'web') {
        try {
            const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
            return (
                <MaterialCommunityIcons
                    name={name}
                    size={size}
                    color={color}
                    style={style}
                    {...props}
                />
            );
        } catch (error) {
            console.warn('Vector icons not available:', error.message);
        }
    }

    // Fallback for web or when vector icons fail
    // You can customize this to show different symbols based on icon name
    const getFallbackIcon = (iconName) => {
        const iconMap = {
            'view-dashboard': '⊞',
            'view-dashboard-outline': '⊡',
            'finance': '💰',
            'book-open-page-variant': '📖',
            'book-open-page-variant-outline': '📖',
            'clipboard-check': '✓',
            'clipboard-check-outline': '☐',
            'account-circle': '👤',
            'account-circle-outline': '👤',
            'forum': '💬',
            'forum-outline': '💬',
            'calendar-month': '📅',
            'calendar-month-outline': '📅',
            'chevron-right': '›',
            'arrow-left': '‹',
            'close': '×',
            'plus': '+',
            'dots-vertical': '⋮',
            'check': '✓',
            'star': '★',
            'clock-outline': '🕐',
            'map-marker': '📍',
            'map-marker-outline': '📍',
            'account': '👤',
            'account-group': '👥',
            'account-group-outline': '👥',
            'default': '●'
        };

        return iconMap[iconName] || iconMap.default;
    };

    return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
            <Text
                style={{
                    fontSize: size * 0.8,
                    color: color,
                    textAlign: 'center',
                }}
                {...props}
            >
                {getFallbackIcon(name)}
            </Text>
        </View>
    );
};

export default Icon;