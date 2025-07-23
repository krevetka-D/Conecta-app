const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(
        {
            ...env,
            babel: {
                dangerouslyAddModulePathsToTranspile: [
                    'react-native-vector-icons',
                    'react-native-paper',
                    'react-native-safe-area-context',
                    'react-native-gesture-handler',
                    'react-native-reanimated',
                    '@react-native-community/datetimepicker',
                    '@react-native-community/netinfo',
                    '@react-native-async-storage/async-storage',
                ],
            },
        },
        argv,
    );

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser'),
    };

    // Add aliases for problematic modules
    config.resolve.alias = {
        ...config.resolve.alias,
        'react-native$': 'react-native-web',
        'react-native-vector-icons': 'react-native-vector-icons/dist',
    };

    // Handle font files
    config.module.rules.push({
        test: /\.(ttf|otf|eot|woff|woff2)$/,
        use: {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
            },
        },
    });

    return config;
};
