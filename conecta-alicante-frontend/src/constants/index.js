// src/constants/index.js
export * from './animations';
export * from './config';
export * from './dimensions';
export * from './messages';
export * from './routes';
export * from './theme';

// Re-export commonly used constants for convenience
export { colors, fonts, spacing, borderRadius, shadows, theme } from './theme';
export { SCREEN_NAMES, TAB_NAMES, NAVIGATOR_NAMES } from './routes';
export { ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES, CONFIRMATION_MESSAGES } from './messages';
export { API_BASE_URL, PROFESSIONAL_PATHS, CHECKLIST_ITEMS, BUDGET_CATEGORIES } from './config';