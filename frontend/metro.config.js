const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
    // Use CSS for styling web builds.
    isCSSEnabled: true,
});

// Enable `require.context` for Expo Router.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;