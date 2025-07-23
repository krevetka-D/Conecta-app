import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback } from 'react';
import { Platform, TouchableOpacity, TextInput } from 'react-native';

import { colors, fonts } from '../../constants/theme';

const WebDateTimePicker = ({ value, mode, onChange, display, ...props }) => {
    if (Platform.OS === 'web') {
        // Web fallback using HTML input
        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatTime = (date) => {
            const d = new Date(date);
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        const handleChange = (event) => {
            const newValue = event.target.value;
            if (newValue) {
                let newDate;
                if (mode === 'date') {
                    newDate = new Date(newValue);
                } else {
                    const [hours, minutes] = newValue.split(':');
                    newDate = new Date(value);
                    newDate.setHours(parseInt(hours));
                    newDate.setMinutes(parseInt(minutes));
                }
                onChange({ type: 'set', nativeEvent: { timestamp: newDate.getTime() } }, newDate);
            }
        };

        return (
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: colors.text,
                    backgroundColor: colors.surface,
                }}
                type={mode === 'date' ? 'date' : 'time'}
                value={mode === 'date' ? formatDate(value) : formatTime(value)}
                onChange={handleChange}
                {...props}
            />
        );
    }

    // Native DateTimePicker
    return (
        <DateTimePicker
            value={value}
            mode={mode}
            display={display}
            onChange={onChange}
            {...props}
        />
    );
};

export default WebDateTimePicker;
