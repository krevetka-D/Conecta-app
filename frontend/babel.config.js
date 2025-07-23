module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
                    alias: {
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@services': './src/services',
                        '@utils': './src/utils',
                        '@constants': './src/constants',
                        '@store': './src/store',
                        '@hooks': './src/hooks',
                        '@navigation': './src/navigation',
                        '@styles': './src/styles',
                    },
                },
            ],
            [
                'react-native-reanimated/plugin',
                {
                    relativeSourceLocation: true,
                },
            ],
        ],
    };
};
