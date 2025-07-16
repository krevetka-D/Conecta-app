// jest.config.js
module.exports = {
    preset: 'react-native',

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

    // Transform files
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },

    // Module file extensions
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.spec.js',
    ],

    // Coverage collection
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/**/*.styles.js',
        '!src/**/index.js',
        '!**/node_modules/**',
        '!**/vendor/**',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Module name mapper for assets
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    },

    // Transform ignore patterns
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@react-native-community|expo|@expo|@unimodules|react-native-svg)/)',
    ],

    // Test environment
    testEnvironment: 'node',

    // Timers
    timers: 'fake',

    // Verbose output
    verbose: true,
};