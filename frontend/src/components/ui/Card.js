
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/components/ui/CardStyles';

export const Card = React.memo(({
                                    children,
                                    onPress,
                                    variant = 'elevated',
                                    padding = 'medium',
                                    style,
                                    activeOpacity = 0.8,
                                    disabled = false,
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

    const componentProps = onPress ? {
        onPress,
        activeOpacity,
        disabled,
        ...props
    } : props;

    return (
        <Component style={cardStyle} {...componentProps}>
            {children}
        </Component>
    );
});