
export const PROFESSIONAL_PATHS = {
    FREELANCER: 'FREELANCER',
    ENTREPRENEUR: 'ENTREPRENEUR',
};

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