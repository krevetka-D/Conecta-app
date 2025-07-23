// frontend/metro.config.js
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'web.js', 'web.ts', 'web.tsx'];

// Configure module resolution
config.resolver.extraNodeModules = {
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@constants': path.resolve(__dirname, 'src/constants'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@navigation': path.resolve(__dirname, 'src/navigation'),
    '@styles': path.resolve(__dirname, 'src/styles'),
    ...config.resolver.extraNodeModules,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
};

// Watch all files in the project
config.watchFolders = [path.resolve(__dirname)];

module.exports = config;
