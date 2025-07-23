import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { styles } from '../../styles/components/ui/CardStyles';

const Card = React.memo(
    ({
        children,
        onPress,
        variant = 'elevated',
        padding = 'medium',
        style,
        contentStyle,
        activeOpacity = 0.8,
        disabled = false,
        overflow = 'hidden',
        ...props
    }) => {
        const Component = onPress ? TouchableOpacity : View;

        const cardStyle = [
            styles.base,
            styles[variant],
            styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
            disabled && styles.disabled,
            style,
        ];

        const innerContentStyle = [styles.content, { overflow }, contentStyle];

        const componentProps = onPress
            ? {
                onPress,
                activeOpacity,
                disabled,
                ...props,
            }
            : props;

        return (
            <Component style={cardStyle} {...componentProps}>
                <View style={innerContentStyle}>{children}</View>
            </Component>
        );
    },
);

Card.displayName = 'Card';

export { Card };
