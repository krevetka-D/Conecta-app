// Development logging utility
// Only logs in development mode to keep production clean

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

/**
 * Development logging utility
 * @param {string} category - Log category (e.g., 'API', 'Auth', 'Socket')
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
export const devLog = (category, message, data = null) => {
    if (!isDevelopment) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${category}]`;

    if (data) {
        console.log(`${prefix} ${message}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
};

/**
 * Development error logging utility
 * @param {string} category - Error category
 * @param {string} message - Error message
 * @param {Error|any} error - Error object or data
 */
export const devError = (category, message, error = null) => {
    if (!isDevelopment && !error) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [ERROR] [${category}]`;

    if (error) {
        console.error(`${prefix} ${message}`, error);
    } else {
        console.error(`${prefix} ${message}`);
    }
};

/**
 * Development warning logging utility
 * @param {string} category - Warning category
 * @param {string} message - Warning message
 * @param {any} data - Additional data
 */
export const devWarn = (category, message, data = null) => {
    if (!isDevelopment) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [WARN] [${category}]`;

    if (data) {
        console.warn(`${prefix} ${message}`, data);
    } else {
        console.warn(`${prefix} ${message}`);
    }
};

export default {
    log: devLog,
    error: devError,
    warn: devWarn,
};