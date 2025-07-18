// src/components/common/EmptyState.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon.js';
import { styles } from '../../styles/components/common/EmptyStateStyles';

const EmptyState = ({
                        icon = 'inbox-outline',
                        title = 'No data available',
                        message = 'There is nothing to display at the moment.',
                        iconSize = 64,
                        iconColor,
                        action,
                        style,
                        titleStyle,
                        messageStyle,
                    }) => {
    return (
        <View style={[styles.container, style]}>
            <Icon
                name={icon}
                size={iconSize}
                color={iconColor || styles.icon.color}
                style={styles.icon}
            />
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <Text style={[styles.message, messageStyle]}>{message}</Text>
            {action && (
                <View style={styles.actionContainer}>
                    {action}
                </View>
            )}
        </View>
    );
};

export default EmptyState;