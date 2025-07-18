import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import contexts in correct order
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider, useTheme } from './store/contexts/ThemeContext';

// Import navigation
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import OnboardingNavigator from './navigation/OnboardingNavigator';

// Import services
import authService from './services/authService';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await authService.getToken();
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                
                if (!userData.preferences || !userData.hasCompletedOnboarding) {
                    setShowOnboarding(true);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading..." />;
    }

    if (!user) {
        return <AuthNavigator />;
    }

    if (showOnboarding) {
        return <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />;
    }

    return <MainNavigator />;
};

const App = () => {
    return (
        <SafeAreaProvider>
            <AppProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <PaperProvider>
                            <NavigationContainer>
                                <AppContent />
                            </NavigationContainer>
                        </PaperProvider>
                    </AuthProvider>
                </ThemeProvider>
            </AppProvider>
        </SafeAreaProvider>
    );
};

export default App;