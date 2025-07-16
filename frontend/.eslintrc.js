// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        '@react-native-community',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        es6: true,
        node: true,
        jest: true,
        'react-native/react-native': true,
    },
    plugins: [
        'react',
        'react-native',
        'react-hooks',
        'import',
    ],
    rules: {
        // General
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'prefer-const': 'error',
        'no-var': 'error',

        // React
        'react/prop-types': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
        'react/jsx-props-no-spreading': 'off',
        'react/no-unescaped-entities': 'off',

        // React Native
        'react-native/no-unused-styles': 'error',
        'react-native/split-platform-components': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-raw-text': 'off',

        // React Hooks
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Import
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
        'import/no-unresolved': 'off',

        // Style
        'comma-dangle': ['error', 'always-multiline'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'indent': ['error', 4],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'max-len': ['warn', { code: 100, ignoreStrings: true }],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};