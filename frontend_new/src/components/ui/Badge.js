
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
    const badgeStyle = [
        styles.base,
        styles[variant],
        styles[size],
        style,
    ];

    const badgeTextStyle = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        textStyle,
    ];

    return (
        <View style={badgeStyle}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={badgeTextStyle}>{text}</Text>
        </View>
    );
});