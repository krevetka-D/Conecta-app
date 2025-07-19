// frontend/src/utils/globalPatches.js
import React from 'react';
import { ActivityIndicator, Text, TextInput } from 'react-native';

/**
 * Global patches for React Native components to fix common issues
 * Import this file at the very top of your App.js
 */

// Store original components
const OriginalActivityIndicator = ActivityIndicator;
const OriginalText = Text;
const OriginalTextInput = TextInput;

// === PATCH 1: ActivityIndicator Size Fix ===
export const PatchedActivityIndicator = React.forwardRef((props, ref) => {
    let { size, ...restProps } = props;
    
    // Debug logging in development
    if (__DEV__ && size && typeof size === 'string' && size !== 'small' && size !== 'large') {
        console.log(`[ActivityIndicator Patch] Converting invalid size "${size}" to valid size`);
    }
    
    // Ensure size is valid
    if (size && typeof size === 'string') {
        const lowerSize = size.toLowerCase();
        if (size !== 'small' && size !== 'large') {
            // Convert common size variations
            if (lowerSize.includes('small') || lowerSize.includes('tiny') || lowerSize === 'xs' || lowerSize === 'sm') {
                size = 'small';
            } else {
                size = 'large';
            }
        }
    } else if (typeof size === 'number') {
        // Convert numeric sizes to valid string sizes
        size = size < 30 ? 'small' : 'large';
    } else if (!size) {
        // Default size
        size = 'large';
    }
    
    return <OriginalActivityIndicator ref={ref} size={size} {...restProps} />;
});

// Copy static properties and methods
Object.setPrototypeOf(PatchedActivityIndicator, OriginalActivityIndicator);
for (const key in OriginalActivityIndicator) {
    if (OriginalActivityIndicator.hasOwnProperty(key)) {
        PatchedActivityIndicator[key] = OriginalActivityIndicator[key];
    }
}

// === PATCH 2: Text Component Number Fix ===
export const PatchedText = React.forwardRef((props, ref) => {
    const { children, ...restProps } = props;
    
    // Convert children to string if it's a number to prevent issues
    let safeChildren = children;
    if (typeof children === 'number') {
        safeChildren = String(children);
    } else if (Array.isArray(children)) {
        safeChildren = children.map(child => 
            typeof child === 'number' ? String(child) : child
        );
    }
    
    return <OriginalText ref={ref} {...restProps}>{safeChildren}</OriginalText>;
});

// Copy static properties
Object.setPrototypeOf(PatchedText, OriginalText);
for (const key in OriginalText) {
    if (OriginalText.hasOwnProperty(key)) {
        PatchedText[key] = OriginalText[key];
    }
}

// === PATCH 3: TextInput Value Sanitization ===
export const PatchedTextInput = React.forwardRef((props, ref) => {
    const { value, defaultValue, ...restProps } = props;
    
    // Ensure value is always a string
    const safeValue = value !== undefined && value !== null ? String(value) : value;
    const safeDefaultValue = defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : defaultValue;
    
    return (
        <OriginalTextInput 
            ref={ref} 
            value={safeValue} 
            defaultValue={safeDefaultValue} 
            {...restProps} 
        />
    );
});

// Copy static properties
Object.setPrototypeOf(PatchedTextInput, OriginalTextInput);
for (const key in OriginalTextInput) {
    if (OriginalTextInput.hasOwnProperty(key)) {
        PatchedTextInput[key] = OriginalTextInput[key];
    }
}

// === Apply All Patches ===
export const applyGlobalPatches = () => {
    if (__DEV__) {
        console.log('[Global Patches] Applying React Native component patches...');
    }
    
    // Override the components globally
    global.ActivityIndicator = PatchedActivityIndicator;
    global.Text = PatchedText;
    global.TextInput = PatchedTextInput;
    
    // Also patch the React Native exports
    const RN = require('react-native');
    RN.ActivityIndicator = PatchedActivityIndicator;
    RN.Text = PatchedText;
    RN.TextInput = PatchedTextInput;
    
    if (__DEV__) {
        console.log('[Global Patches] ✓ ActivityIndicator patched');
        console.log('[Global Patches] ✓ Text patched');
        console.log('[Global Patches] ✓ TextInput patched');
        console.log('[Global Patches] All patches applied successfully');
    }
};

// === Utility Functions ===

/**
 * Validate and convert size prop for ActivityIndicator
 */
export const validateActivityIndicatorSize = (size) => {
    if (typeof size === 'string') {
        if (size === 'small' || size === 'large') {
            return size;
        }
        const lowerSize = size.toLowerCase();
        if (lowerSize.includes('small') || lowerSize.includes('tiny') || lowerSize === 'xs' || lowerSize === 'sm') {
            return 'small';
        }
        return 'large';
    }
    if (typeof size === 'number') {
        return size < 30 ? 'small' : 'large';
    }
    return 'large';
};

/**
 * Safe number to string conversion for display
 */
export const safeNumberToString = (value, decimals = 2) => {
    if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return String(value);
        }
        return value.toFixed(decimals);
    }
    return String(value || '');
};

// === Error Boundary for Patched Components ===
export class PatchedComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (__DEV__) {
            console.error('[Patched Component Error]:', error);
            console.error('Error Info:', errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <Text style={{ color: 'red', padding: 20, textAlign: 'center' }}>
                    Component Error: {this.state.error?.message || 'Unknown error'}
                </Text>
            );
        }
        return this.props.children;
    }
}

// Export patched components for direct use
export {
    PatchedActivityIndicator as ActivityIndicator,
    PatchedText as Text,
    PatchedTextInput as TextInput,
};