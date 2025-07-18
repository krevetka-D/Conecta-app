// frontend/babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
      'module:@react-native/babel-preset'
    ],
    plugins: [
      'react-native-reanimated/plugin', // needs to be last
    ],
  };
};