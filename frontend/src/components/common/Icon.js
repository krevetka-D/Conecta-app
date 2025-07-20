import React from 'react';
import { Platform, Text } from 'react-native';

// Conditional import for vector icons
let MaterialCommunityIcons;

if (Platform.OS !== 'web') {
  MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
} else {
  // For web, we'll use a fallback
  MaterialCommunityIcons = ({ name, size, color, style, ...props }) => {
    // You can replace this with actual web icon library like react-icons
    return (
      <Text
        style={[
          {
            fontSize: size || 24,
            color: color || '#000',
            fontFamily: 'MaterialIcons',
          },
          style,
        ]}
        {...props}
      >
        {name ? '●' : ''}
      </Text>
    );
  };
}

// Icon component with proper error handling
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
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