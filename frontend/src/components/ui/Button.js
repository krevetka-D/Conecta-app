// frontend/src/components/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

import { styles } from '../../styles/components/ui/ButtonStyles';

const Button = React.memo(
    ({
        title,
        onPress,
        variant = 'primary',
        size = 'medium',
        loading = false,
        disabled = false,
        icon,
        iconPosition = 'left',
        fullWidth = false,
        style,
        textStyle,
        ...props
    }) => {
        // Ensure size is valid
        const validSize = ['small', 'medium', 'large'].includes(size) ? size : 'medium';

        const buttonStyle = [
            styles.base,
            styles[variant] || styles.primary,
            styles[validSize],
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            style,
        ];

        const textStyles = [
            styles.text,
            styles[`${variant}Text`] || styles.primaryText,
            styles[`${validSize}Text`],
            disabled && styles.disabledText,
            textStyle,
        ];

        const renderContent = () => {
            if (loading) {
                // Ensure ActivityIndicator receives proper size
                const spinnerSize = validSize === 'small' ? 'small' : 'large';
                const spinnerColor = variant === 'primary' ? '#fff' : '#1E3A8A';

                return <ActivityIndicator color={spinnerColor} size={spinnerSize} />;
            }

            return (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                    {icon && iconPosition === 'right' && (
                        <View style={styles.iconRight}>{icon}</View>
                    )}
                </View>
            );
        };

        return (
            <TouchableOpacity
                style={buttonStyle}
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                {...props}
            >
                {renderContent()}
            </TouchableOpacity>
        );
    },
);

Button.displayName = 'Button';

export { Button };
