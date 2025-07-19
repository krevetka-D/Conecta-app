import React from 'react';
import { Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Icon component with proper error handling
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
    // Return the actual vector icon component
    return (
        <MaterialCommunityIcons
            name={name}
            size={size}
            color={color}
            style={style}
            {...props}
        />
    );
};

export default Icon;