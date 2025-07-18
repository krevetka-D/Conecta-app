// frontend/metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        // Add fallbacks for node modules
        alias: {
            crypto: require.resolve('react-native-crypto'),
            stream: require.resolve('readable-stream'),
            buffer: require.resolve('buffer'),
        },
        // Ensure these extensions are resolved
        sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
        assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
    },
    transformer: {
        // Ensure Hermes transforms work correctly
        hermesParser: true,
        unstable_allowRequireContext: true,
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);