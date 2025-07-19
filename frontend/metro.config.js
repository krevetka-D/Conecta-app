// // frontend/metro.config.js
// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {
//     resolver: {
//         // Ensure these extensions are resolved (including font files)
//         sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
//         assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'woff', 'woff2'],
//     },
//     transformer: {
//         // Use default transformer settings
//         getTransformOptions: async () => ({
//             transform: {
//                 experimentalImportSupport: false,
//                 inlineRequires: true,
//             },
//         }),
//     },
// };

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);


// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    const { transformer, resolver } = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
        minifierConfig: {
            keep_fnames: true,
            mangle: {
                keep_fnames: true,
            },
        },
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
        sourceExts: [...resolver.sourceExts, 'svg'],
    };

    // Enable Hermes
    config.transformer.hermesParser = true;

    return config;
})();