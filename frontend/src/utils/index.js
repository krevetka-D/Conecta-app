// src/utils/index.js
// Export all utilities

// Alert utilities
export {
    showErrorAlert,
    showConfirmAlert,
    showSuccessAlert,
} from './alerts';

// Constants utilities
export * from './constants';

// Formatting utilities
export {
    formatCurrency,
    formatDate,
    formatPhoneNumber,
    truncateText,
} from './formatting';

// Performance utilities
export {
    runAfterInteractions,
    debounce,
    throttle,
} from './performance';

// Security utilities
export {
    secureStorage,
    generateSecureToken,
    sanitizeInput,
    isValidUrl,
    hashData,
} from './security';

// Storage utilities
export { storage } from './storage';

// Validation utilities
export {
    validateEmail,
    validatePassword,
} from './validation';