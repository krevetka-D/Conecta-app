// src/utils/constants.js
// App-wide constants that don't fit in other category files

export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Conecta Alicante';

export const STORAGE_KEYS = {
    TOKEN: '@conecta_token',
    USER: '@conecta_user',
    THEME: '@conecta_theme',
    LANGUAGE: '@conecta_language',
    ONBOARDING_COMPLETED: '@conecta_onboarding_completed',
    LAST_SYNC: '@conecta_last_sync',
};

export const DATE_FORMATS = {
    display: 'MMM d, yyyy',
    displayWithTime: 'MMM d, yyyy h:mm a',
    input: 'yyyy-MM-dd',
    api: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
    relative: 'relative',
};

export const CURRENCY = {
    code: 'EUR',
    symbol: '€',
    locale: 'es-ES',
    decimalPlaces: 2,
};

export const PAGINATION = {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
};

export const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    avatar: 2 * 1024 * 1024, // 2MB
};

export const SUPPORTED_FILE_TYPES = {
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    documents: ['pdf', 'doc', 'docx', 'txt'],
};

export const REGEX_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    spanishNIE: /^[XYZ]\d{7}[A-Z]$/,
    spanishNIF: /^\d{8}[A-Z]$/,
};

export const DEBOUNCE_DELAYS = {
    search: 500,
    input: 300,
    scroll: 100,
};

export const REFRESH_INTERVALS = {
    dashboard: 60000, // 1 minute
    notifications: 30000, // 30 seconds
    events: 300000, // 5 minutes
};

export const MAX_LENGTHS = {
    name: 50,
    email: 100,
    password: 128,
    description: 500,
    shortText: 100,
    longText: 1000,
};

export const SOCIAL_LINKS = {
    website: 'https://conectaalicante.com',
    email: 'support@conectaalicante.com',
    facebook: 'https://facebook.com/conectaalicante',
    instagram: 'https://instagram.com/conectaalicante',
    linkedin: 'https://linkedin.com/company/conectaalicante',
};
