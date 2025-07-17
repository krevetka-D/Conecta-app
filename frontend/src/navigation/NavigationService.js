import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { SCREEN_NAMES } from '../constants/routes';

// --- Navigation Reference ---
export const navigationRef = createNavigationContainerRef();

/**
 * Resets the navigation stack to the Authentication flow (Login screen).
 * This is the primary function for logging a user out.
 * It now checks if the navigation container is ready before dispatching the action.
 */
export function resetRoot() {
    // IMPORTANT: Check if the navigation reference is attached and ready
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: SCREEN_NAMES.LOGIN }],
            })
        );
    } else {
        // This is a fallback. In a real-world scenario, you might queue this action
        // or handle it differently, but for now, logging it is crucial.
        console.warn('Navigation not ready, reset to root was skipped.');
    }
}