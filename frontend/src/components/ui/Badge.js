
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/components/ui/BadgeStyles';

export const Badge = React.memo(({
    text,
    variant = 'default',
    size = 'medium',
    icon,
    style,
    textStyle,
}) => {
    // Ensure size is a valid string
    const validSize = ['small', 'medium', 'large'].includes(size) ? size : 'medium';
    
    const badgeStyle = [
        styles.base,
        styles[variant] || styles.default,
        styles[validSize],
        style,
    ];

    const badgeTextStyle = [
        styles.text,
        styles[`${variant}Text`] || styles.defaultText,
        styles[`${validSize}Text`],
        textStyle,
    ];

    return (
        <View style={badgeStyle}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={badgeTextStyle}>{String(text)}</Text>
        </View>
    );
});