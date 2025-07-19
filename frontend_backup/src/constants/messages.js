
// Error Messages
export const ERROR_MESSAGES = {
    // Generic errors
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',

    // Authentication errors
    LOGIN_FAILED: 'Invalid email or password.',
    REGISTRATION_FAILED: 'Registration failed. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    USER_NOT_FOUND: 'User not found.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    INVALID_CREDENTIALS: 'Invalid credentials provided.',

    // Validation errors
    VALIDATION_ERROR: 'Please check your input and try again.',
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 6 characters long.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_NIE: 'Please enter a valid NIE number.',
    INVALID_AMOUNT: 'Please enter a valid amount.',

    // Budget errors
    BUDGET_ENTRY_FAILED: 'Failed to add budget entry.',
    BUDGET_UPDATE_FAILED: 'Failed to update budget entry.',
    BUDGET_DELETE_FAILED: 'Failed to delete budget entry.',
    BUDGET_LOAD_FAILED: 'Failed to load budget entries.',

    // Checklist errors
    CHECKLIST_UPDATE_FAILED: 'Failed to update checklist item.',
    CHECKLIST_LOAD_FAILED: 'Failed to load checklist.',

    // Content errors
    GUIDE_LOAD_FAILED: 'Failed to load guide.',
    CONTENT_NOT_FOUND: 'Content not found.',

    // File errors
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    FILE_UPLOAD_FAILED: 'Failed to upload file.',

    // Permission errors
    CAMERA_PERMISSION_DENIED: 'Camera permission denied.',
    LOCATION_PERMISSION_DENIED: 'Location permission denied.',
    STORAGE_PERMISSION_DENIED: 'Storage permission denied.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    // Generic success
    GENERIC_SUCCESS: 'Operation completed successfully!',
    SAVED: 'Saved successfully!',
    UPDATED: 'Updated successfully!',
    DELETED: 'Deleted successfully!',

    // Authentication success
    LOGIN_SUCCESS: 'Welcome back!',
    REGISTRATION_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'You have been logged out.',
    PASSWORD_CHANGED: 'Password changed successfully!',

    // Profile success
    PROFILE_UPDATED: 'Profile updated successfully!',

    // Budget success
    ENTRY_ADDED: 'Entry added successfully!',
    ENTRY_UPDATED: 'Entry updated successfully!',
    ENTRY_DELETED: 'Entry deleted successfully!',

    // Checklist success
    CHECKLIST_UPDATED: 'Checklist updated successfully!',
    TASK_COMPLETED: 'Task marked as completed!',

    // File success
    FILE_UPLOADED: 'File uploaded successfully!',

    // Settings success
    SETTINGS_UPDATED: 'Settings updated successfully!',
    NOTIFICATIONS_ENABLED: 'Notifications enabled.',
    NOTIFICATIONS_DISABLED: 'Notifications disabled.',
};

// Info Messages
export const INFO_MESSAGES = {
    // Loading states
    LOADING: 'Loading...',
    LOADING_DATA: 'Loading data...',
    PROCESSING: 'Processing...',
    PLEASE_WAIT: 'Please wait...',

    // Empty states
    NO_DATA: 'No data available.',
    NO_RESULTS: 'No results found.',
    NO_ENTRIES: 'No entries yet.',
    NO_TRANSACTIONS: 'No transactions yet.',
    NO_GUIDES: 'No guides available.',
    NO_SERVICES: 'No services found.',
    NO_EVENTS: 'No upcoming events.',

    // Onboarding
    WELCOME: 'Welcome to Conecta Alicante!',
    COMPLETE_PROFILE: 'Please complete your profile to get started.',
    SELECT_PATH: 'Please select your professional path.',
    SELECT_PRIORITIES: 'Please select at least one priority.',

    // Network status
    OFFLINE_MODE: 'You are currently offline.',
    SYNC_PENDING: 'Changes will be synced when online.',

    // Feature info
    COMING_SOON: 'This feature is coming soon!',
    BETA_FEATURE: 'This is a beta feature.',
    PREMIUM_FEATURE: 'This is a premium feature.',
};

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
    // Generic confirmations
    ARE_YOU_SURE: 'Are you sure?',
    CONFIRM_ACTION: 'Are you sure you want to continue?',
    CANNOT_UNDO: 'This action cannot be undone.',

    // Specific confirmations
    DELETE_ENTRY: 'Are you sure you want to delete this entry?',
    DELETE_ACCOUNT: 'Are you sure you want to delete your account? This action cannot be undone.',
    LOGOUT: 'Are you sure you want to logout?',
    DISCARD_CHANGES: 'Are you sure you want to discard your changes?',
    CANCEL_UPLOAD: 'Are you sure you want to cancel the upload?',

    // Navigation confirmations
    LEAVE_PAGE: 'Are you sure you want to leave? Your changes will be lost.',
    EXIT_APP: 'Are you sure you want to exit the app?',
};

// Validation Messages
export const VALIDATION_MESSAGES = {
    // Field validation
    FIELD_REQUIRED: (field) => `${field} is required.`,
    MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters.`,
    MAX_LENGTH: (field, length) => `${field} must not exceed ${length} characters.`,
    MIN_VALUE: (field, value) => `${field} must be at least ${value}.`,
    MAX_VALUE: (field, value) => `${field} must not exceed ${value}.`,

    // Format validation
    INVALID_FORMAT: (field) => `${field} format is invalid.`,
    NUMBERS_ONLY: 'Only numbers are allowed.',
    LETTERS_ONLY: 'Only letters are allowed.',
    NO_SPECIAL_CHARS: 'Special characters are not allowed.',

    // Date validation
    FUTURE_DATE_REQUIRED: 'Please select a future date.',
    PAST_DATE_REQUIRED: 'Please select a past date.',
    INVALID_DATE_RANGE: 'Invalid date range.',
};

// Placeholder Messages
export const PLACEHOLDER_MESSAGES = {
    // Input placeholders
    EMAIL: 'Enter your email',
    PASSWORD: 'Enter your password',
    NAME: 'Enter your name',
    DESCRIPTION: 'Enter description (optional)',
    AMOUNT: 'Enter amount',
    SEARCH: 'Search...',

    // Select placeholders
    SELECT_CATEGORY: 'Select a category',
    SELECT_DATE: 'Select a date',
    SELECT_TYPE: 'Select type',
    SELECT_PRIORITY: 'Select priority',
};

// Button Labels
export const BUTTON_LABELS = {
    // Actions
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    UPDATE: 'Update',
    SUBMIT: 'Submit',
    CONFIRM: 'Confirm',

    // Navigation
    BACK: 'Back',
    NEXT: 'Next',
    CONTINUE: 'Continue',
    SKIP: 'Skip',
    DONE: 'Done',

    // Auth
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'Forgot Password?',

    // Other
    ADD: 'Add',
    REMOVE: 'Remove',
    SEARCH: 'Search',
    FILTER: 'Filter',
    SORT: 'Sort',
    REFRESH: 'Refresh',
    RETRY: 'Retry',
    LEARN_MORE: 'Learn More',
    GET_STARTED: 'Get Started',
};

// Tooltip Messages
export const TOOLTIP_MESSAGES = {
    PASSWORD_REQUIREMENTS: 'Password must be at least 6 characters long.',
    NIE_FORMAT: 'NIE format: X1234567A',
    PHONE_FORMAT: 'Include country code (e.g., +34)',
    CURRENCY_INFO: 'All amounts are in EUR (€)',
};

// Status Messages
export const STATUS_MESSAGES = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    ONLINE: 'Online',
    OFFLINE: 'Offline',
};