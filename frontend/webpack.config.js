// frontend/webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-native-community/datetimepicker',
          '@react-native-community/netinfo',
          'react-native-modal',
          'react-native-vector-icons',
        ],
      },
    },
    argv
  );

  // Customize the config
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    '@components': './src/components',
    '@screens': './src/screens',
    '@services': './src/services',
    '@utils': './src/utils',
    '@constants': './src/constants',
    '@store': './src/store',
    '@hooks': './src/hooks',
    '@navigation': './src/navigation',
    '@styles': './src/styles',
  };

  // Handle vector icons for web
  config.module.rules.push({
    test: /\.ttf$/,
    loader: 'url-loader',
    include: /react-native-vector-icons/,
  });

  return config;
};