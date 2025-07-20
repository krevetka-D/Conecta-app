// frontend/index.js
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// For testing - switch between different app versions
const APP_VERSION = 'navigators'; // Options: 'minimal', 'gradual', 'full'

let App;
switch (APP_VERSION) {
    case 'minimal':
        App = require('./src/AppMinimal').default;
        break;
    case 'gradual':
        App = require('./src/AppGradual').default;
        break;
    case 'full':
    default:
      case 'navigators':
    App = require('./src/AppTestNavigators').default;
    break;

        App = require('./src/App').default;
        break;
}

// Register the app
registerRootComponent(App);

// For web
if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    if (rootTag) {
        import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(rootTag);
            root.render(<App />);
        }).catch(console.error);
    }
}