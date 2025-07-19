import React, { memo, useCallback, useState } from 'react';
import { TextInput as RNTextInput, View, Text } from 'react-native';
import { styles } from '../../styles/components/ui/InputStyles';

export const OptimizedInput = memo(({
    label,
    value,
    onChangeText,
    error,
    multiline = false,
    numberOfLines = 1,
    style,
    ...props
}) => {
    // Use local state for immediate feedback
    const [localValue, setLocalValue] = useState(value || '');

    // Debounced update to parent
    const handleChange = useCallback((text) => {
        setLocalValue(text);
        // Update parent immediately for better UX
        if (onChangeText) {
            onChangeText(text);
        }
    }, [onChangeText]);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <RNTextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    error && styles.errorInput,
                    style
                ]}
                value={localValue}
                onChangeText={handleChange}
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical={multiline ? 'top' : 'center'}
                // Disable autoCorrect for better performance
                autoCorrect={false}
                // Remove spell check on Android
                spellCheck={false}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
});