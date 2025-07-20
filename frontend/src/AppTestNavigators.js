// frontend/src/AppTestNavigators.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

// Import contexts
import { AppProvider } from './store/contexts/AppContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import { AuthProvider } from './store/contexts/AuthContext';

// Test which navigator causes issues
const AppTestNavigators = () => {
    const [currentTest, setCurrentTest] = useState('none');
    const [error, setError] = useState(null);

    const renderTest = () => {
        try {
            switch (currentTest) {
                case 'auth':
                    const AuthNavigator = require('./navigation/AuthNavigator').default;
                    return <AuthNavigator />;
                
                case 'main':
                    const MainNavigator = require('./navigation/MainNavigator').default;
                    return <MainNavigator />;
                
                case 'onboarding':
                    const OnboardingNavigator = require('./navigation/OnboardingNavigator').default;
                    return <OnboardingNavigator onComplete={() => console.log('Onboarding complete')} />;
                
                default:
                    return (
                        <View style={styles.container}>
                            <Text style={styles.title}>Navigator Tests</Text>
                            <Text style={styles.subtitle}>Test each navigator individually</Text>
                            
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => setCurrentTest('auth')}
                            >
                                <Text style={styles.buttonText}>Test Auth Navigator</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.buttonSecondary]}
                                onPress={() => setCurrentTest('main')}
                            >
                                <Text style={styles.buttonText}>Test Main Navigator</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.buttonTertiary]}
                                onPress={() => setCurrentTest('onboarding')}
                            >
                                <Text style={styles.buttonText}>Test Onboarding Navigator</Text>
                            </TouchableOpacity>
                        </View>
                    );
            }
        } catch (err) {
            setError(err.message);
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Error in {currentTest} navigator:</Text>
                    <Text style={styles.errorText}>{err.message}</Text>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => {
                            setCurrentTest('none');
                            setError(null);
                        }}
                    >
                        <Text style={styles.buttonText}>Back to Menu</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <SafeAreaProvider>
            <AppProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <PaperProvider>
                            <SafeAreaView style={styles.safeArea}>
                                <NavigationContainer>
                                    {renderTest()}
                                </NavigationContainer>
                                {currentTest !== 'none' && (
                                    <TouchableOpacity 
                                        style={styles.backButton}
                                        onPress={() => setCurrentTest('none')}
                                    >
                                        <Text style={styles.backButtonText}>← Back to Menu</Text>
                                    </TouchableOpacity>
                                )}
                            </SafeAreaView>
                        </PaperProvider>
                    </AuthProvider>
                </ThemeProvider>
            </AppProvider>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#1E3A8A',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 15,
        minWidth: 250,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#3B82F6',
    },
    buttonTertiary: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonText: {
        color: '#1E3A8A',
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
});

export default AppTestNavigators;