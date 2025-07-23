import React, { forwardRef } from 'react';
import { View, TextInput, Text } from 'react-native';

import { inputStyles as styles } from '../../styles/components/ui/InputStyles';

const Input = forwardRef(
    ({ label, error, leftIcon, rightIcon, style, containerStyle, ...props }, ref) => {
        return (
            <View style={[styles.container, containerStyle]}>
                {label && <Text style={styles.label}>{label}</Text>}
                <View style={[styles.inputContainer, error && styles.errorContainer]}>
                    {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            leftIcon && styles.inputWithLeftIcon,
                            rightIcon && styles.inputWithRightIcon,
                            style,
                        ]}
                        placeholderTextColor="#9CA3AF"
                        {...props}
                    />
                    {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        );
    },
);

Input.displayName = 'Input';

export { Input };
