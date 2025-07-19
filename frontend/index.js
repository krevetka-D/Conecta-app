/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Import and apply patches
import './src/utils/polyfills';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader requires',
  'Non-serializable values were found',
  'Unable to convert string to floating point value',
  'EventEmitter.removeListener',
]);

AppRegistry.registerComponent(appName, () => App);