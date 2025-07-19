// babel.config.js
module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            '@babel/plugin-transform-flow-strip-types',
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            'react-native-reanimated/plugin',
            [
                'module-resolver',
                {
                    root: ['./src'],
                    alias: {
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@services': './src/services',
                        '@utils': './src/utils',
                        '@constants': './src/constants',
                        '@navigation': './src/navigation',
                        '@hooks': './src/hooks',
                        '@store': './src/store',
                        '@styles': './src/styles',
                        '@config': './src/config',
                    },
                },
            ],
        ],
        env: {
            production: {
                plugins: ['transform-remove-console'],
            },
        },
    };
};