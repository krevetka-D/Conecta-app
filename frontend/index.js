// frontend/index.js
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

// Polyfills for React Native
import 'react-native-crypto';
import { Buffer } from 'buffer';

// Make Buffer available globally
global.Buffer = Buffer;

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Register the main component
AppRegistry.registerComponent(appName, () => App);