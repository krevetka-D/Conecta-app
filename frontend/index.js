// frontend/index.js
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './src/App';

// Register the app
registerRootComponent(App);

// For web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // eslint-disable-next-line no-undef
    const rootTag = document.getElementById('root') || document.getElementById('main');
    if (rootTag) {
        import('react-dom/client')
            .then(({ createRoot }) => {
                const root = createRoot(rootTag);
                root.render(<App />);
            })
            .catch(console.error);
    }
}
