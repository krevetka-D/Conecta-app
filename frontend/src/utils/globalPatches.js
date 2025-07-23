// frontend/src/utils/globalPatches.js
import React from 'react';
import { ActivityIndicator, Text, TextInput, Platform } from 'react-native';

/**
 * Global patches for React Native components to fix common issues
 * Import this file at the very top of your App.js
 */

// Store original components
const OriginalActivityIndicator = ActivityIndicator;
const OriginalText = Text;
const OriginalTextInput = TextInput;

// Track if patches have been applied
let patchesApplied = false;

// === PATCH 1: ActivityIndicator Size Fix ===
export const PatchedActivityIndicator = React.forwardRef((props, ref) => {
    const { size: originalSize, ...restProps } = props;
    let size = originalSize;

    // Debug logging in development
    if (__DEV__ && size && typeof size === 'string' && size !== 'small' && size !== 'large') {
        console.log(`[ActivityIndicator Patch] Converting invalid size "${size}" to valid size`);
    }

    // Ensure size is valid
    if (size && typeof size === 'string') {
        const lowerSize = size.toLowerCase();
        if (size !== 'small' && size !== 'large') {
            // Convert common size variations
            if (
                lowerSize.includes('small') ||
                lowerSize.includes('tiny') ||
                lowerSize === 'xs' ||
                lowerSize === 'sm'
            ) {
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
PatchedActivityIndicator.displayName = 'PatchedActivityIndicator';

// Copy static properties and methods
Object.setPrototypeOf(PatchedActivityIndicator, OriginalActivityIndicator);
for (const key in OriginalActivityIndicator) {
    if (Object.prototype.hasOwnProperty.call(OriginalActivityIndicator, key)) {
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
        safeChildren = React.Children.map(children, (child) => {
            if (typeof child === 'number') {
                return String(child);
            }
            return child;
        });
    }

    return (
        <OriginalText ref={ref} {...restProps}>
            {safeChildren}
        </OriginalText>
    );
});
PatchedText.displayName = 'PatchedText';

// Copy static properties
Object.setPrototypeOf(PatchedText, OriginalText);
for (const key in OriginalText) {
    if (Object.prototype.hasOwnProperty.call(OriginalText, key)) {
        PatchedText[key] = OriginalText[key];
    }
}

// === PATCH 3: TextInput Value Sanitization ===
export const PatchedTextInput = React.forwardRef((props, ref) => {
    const { value, defaultValue, ...restProps } = props;

    // Ensure value is always a string
    const safeValue = value !== undefined && value !== null ? String(value) : value;
    const safeDefaultValue =
        defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : defaultValue;

    return (
        <OriginalTextInput
            ref={ref}
            value={safeValue}
            defaultValue={safeDefaultValue}
            {...restProps}
        />
    );
});
PatchedTextInput.displayName = 'PatchedTextInput';

// Copy static properties
Object.setPrototypeOf(PatchedTextInput, OriginalTextInput);
for (const key in OriginalTextInput) {
    if (Object.prototype.hasOwnProperty.call(OriginalTextInput, key)) {
        PatchedTextInput[key] = OriginalTextInput[key];
    }
}

// === Apply All Patches ===
export const applyGlobalPatches = () => {
    if (patchesApplied) {
        if (__DEV__) {
            console.log('[Global Patches] Patches already applied, skipping...');
        }
        return;
    }

    if (__DEV__) {
        console.log('[Global Patches] Applying React Native component patches...');
    }

    // Override the components globally
    const RN = require('react-native');

    // Patch ActivityIndicator
    RN.ActivityIndicator = PatchedActivityIndicator;

    // Patch Text
    RN.Text = PatchedText;

    // Patch TextInput
    RN.TextInput = PatchedTextInput;

    // Mark patches as applied
    patchesApplied = true;

    if (__DEV__) {
        console.log('[Global Patches] ✓ ActivityIndicator patched');
        console.log('[Global Patches] ✓ Text patched');
        console.log('[Global Patches] ✓ TextInput patched');
        console.log('[Global Patches] All patches applied successfully');
    }
};

// === Legacy Support for patchActivityIndicator ===
export const patchActivityIndicator = () => {
    if (__DEV__) {
        console.log(
            '[Global Patches] patchActivityIndicator called - redirecting to applyGlobalPatches',
        );
    }
    applyGlobalPatches();
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
        if (
            lowerSize.includes('small') ||
            lowerSize.includes('tiny') ||
            lowerSize === 'xs' ||
            lowerSize === 'sm'
        ) {
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

/**
 * Format currency values safely
 */
export const safeFormatCurrency = (amount, currency = 'EUR') => {
    const safeAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(safeAmount);
    } catch (error) {
        return `€${safeAmount.toFixed(2)}`;
    }
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
            const FallbackText = OriginalText || Text;
            return (
                <FallbackText
                    style={{
                        color: 'red',
                        padding: 20,
                        textAlign: 'center',
                        backgroundColor: '#fee',
                        margin: 10,
                        borderRadius: 5,
                    }}
                >
                    Component Error: {this.state.error?.message || 'Unknown error'}
                </FallbackText>
            );
        }
        return this.props.children;
    }
}

// === Platform-specific patches ===
if (Platform.OS === 'web') {
    // Web-specific patches can go here
    if (__DEV__) {
        console.log('[Global Patches] Running on web platform');
    }
}

// === Performance monitoring ===
if (__DEV__) {
    const originalRender = React.Component.prototype.render;
    let renderCount = 0;

    React.Component.prototype.render = function () {
        renderCount++;
        if (renderCount % 100 === 0) {
            console.log(`[Performance] Total renders: ${renderCount}`);
        }
        return originalRender.call(this);
    };
}

// Export patched components for direct use
export {
    PatchedActivityIndicator as ActivityIndicator,
    PatchedText as Text,
    PatchedTextInput as TextInput,
};

// Default export for convenience
export default {
    applyGlobalPatches,
    patchActivityIndicator,
    ActivityIndicator: PatchedActivityIndicator,
    Text: PatchedText,
    TextInput: PatchedTextInput,
    validateActivityIndicatorSize,
    safeNumberToString,
    safeFormatCurrency,
    PatchedComponentErrorBoundary,
};
