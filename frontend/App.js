// App.js - Minimal version without font loading
import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider, ThemeProvider, AppProvider} from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { theme } from './src/constants';
import NavigationService from './src/navigation/NavigationService';

const App = () => {
    return (
        <ErrorBoundary>
            <AppProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <PaperProvider theme={theme}>
                            <NavigationContainer
                                ref={(navigatorRef) => {
                                    NavigationService.setTopLevelNavigator(navigatorRef);
                                }}
                            >
                                <RootNavigator />
                            </NavigationContainer>
                        </PaperProvider>
                    </ThemeProvider>
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;