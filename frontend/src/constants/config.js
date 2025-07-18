// frontend/src/constants/config.js

// For React Native, use your machine's IP address instead of localhost
// Update this to match your development machine's IP
const DEV_API_URL = 'http://192.168.1.129:5001/api'; // Your MacBook's IP
const PROD_API_URL = 'https://api.conectaalicante.com/api'; // Your production API

// API Configuration
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Professional Paths
export const PROFESSIONAL_PATHS = {
    FREELANCER: 'FREELANCER',
    ENTREPRENEUR: 'ENTREPRENEUR',
};

// Checklist Items Configuration
export const CHECKLIST_ITEMS = {
    FREELANCER: [
        { key: 'OBTAIN_NIE', title: 'Obtain your NIE', description: 'Get your foreigner identification number' },
        { key: 'REGISTER_AUTONOMO', title: 'Register as Autónomo', description: 'Complete your self-employment registration' },
        { key: 'UNDERSTAND_TAXES', title: 'Understand Tax Obligations', description: 'Learn about IVA and IRPF requirements' },
        { key: 'OPEN_BANK_ACCOUNT', title: 'Open Spanish Bank Account', description: 'Set up your business banking' },
    ],
    ENTREPRENEUR: [
        { key: 'OBTAIN_NIE', title: 'Obtain your NIE', description: 'Get your foreigner identification number' },
        { key: 'FORM_SL_COMPANY', title: 'Form an S.L. Company', description: 'Establish your limited liability company' },
        { key: 'GET_COMPANY_NIF', title: 'Get Company NIF', description: 'Obtain your company tax ID' },
        { key: 'RESEARCH_FUNDING', title: 'Research Funding Options', description: 'Explore grants and investment opportunities' },
    ],
};

// Budget Categories Configuration
export const BUDGET_CATEGORIES = {
    FREELANCER: {
        INCOME: [
            'Project-Based Income',
            'Recurring Clients',
            'Passive Income',
            'Other Income',
        ],
        EXPENSE: [
            'Cuota de Autónomo',
            'Office/Coworking',
            'Software & Tools',
            'Professional Services',
            'Marketing',
            'Travel & Transport',
            'Other Expenses',
        ],
    },
    ENTREPRENEUR: {
        INCOME: [
            'Product Sales',
            'Service Revenue',
            'Investor Funding',
            'Grants',
            'Other Income',
        ],
        EXPENSE: [
            'Salaries & Payroll',
            'Office Rent',
            'Legal & Accounting',
            'Marketing & Sales',
            'R&D',
            'Operations',
            'Other Expenses',
        ],
    },
};

// App Configuration
export const APP_CONFIG = {
    APP_NAME: 'Conecta Alicante',
    APP_VERSION: '1.0.0',
    DEFAULT_LANGUAGE: 'en',
    SUPPORTED_LANGUAGES: ['en', 'es'],
};

// Feature Flags
export const FEATURES = {
    ENABLE_FORUMS: true,
    ENABLE_EVENTS: true,
    ENABLE_NOTIFICATIONS: false,
    ENABLE_OFFLINE_MODE: true,
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};

// File Upload Limits
export const FILE_LIMITS = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
    ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx'],
};