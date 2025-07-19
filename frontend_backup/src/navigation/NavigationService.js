
import { createNavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import { SCREEN_NAMES } from '../constants/routes';

// --- Navigation Reference ---
export const navigationRef = createNavigationContainerRef();

/**
 * Check if navigation is ready
 */
export function isNavigationReady() {
    return navigationRef.isReady();
}

/**
 * Navigate to a specific screen
 */
export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.warn('Navigation not ready, navigation to', name, 'was skipped.');
    }
}

/**
 * Go back to previous screen
 */
export function goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
    }
}

/**
 * Resets the navigation stack to the Authentication flow (Login screen).
 * This is the primary function for logging a user out.
 */
export function resetRoot() {
    // Use a timeout to ensure navigation is ready
    const performReset = () => {
        if (navigationRef.isReady()) {
            navigationRef.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: SCREEN_NAMES.WELCOME }],
                })
            );
        } else {
            // If navigation is not ready, try again after a short delay
            setTimeout(performReset, 100);
        }
    };

    performReset();
}

/**
 * Reset to main app (after successful login)
 */
export function resetToMain() {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: SCREEN_NAMES.DASHBOARD }],
            })
        );
    } else {
        // Retry after a short delay
        setTimeout(() => resetToMain(), 100);
    }
}

/**
 * Replace current screen
 */
export function replace(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(name, params));
    } else {
        console.warn('Navigation not ready, replace to', name, 'was skipped.');
    }
}