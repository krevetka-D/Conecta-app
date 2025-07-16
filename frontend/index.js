import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from '../frontend/app.json';

AppRegistry.registerComponent(appName, () => App);