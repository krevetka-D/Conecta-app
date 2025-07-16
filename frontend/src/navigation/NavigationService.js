// src/navigation/NavigationService.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.warn("Navigation service not ready, could not navigate.");
    }
}

export function resetRoot(routeName = 'Login') {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name: routeName }],
        });
    } else {
        console.warn("Navigation service not ready, could not reset root.");
    }
}