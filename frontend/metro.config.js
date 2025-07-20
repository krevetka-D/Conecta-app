// frontend/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

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
};

// Watch all files in the project
config.watchFolders = [path.resolve(__dirname)];

module.exports = config;