// frontend/src/AppGradual.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all providers at the top
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppProvider } from './store/contexts/AppContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import { AuthProvider } from './store/contexts/AuthContext';

// Step 1: Basic navigation test
const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home Screen</Text>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Details')}
            >
                <Text style={styles.buttonText}>Go to Details</Text>
            </TouchableOpacity>
        </View>
    );
};

const DetailsScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Details Screen</Text>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const AppGradual = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);

    const goToNextStep = () => {
        setError(null);
        setIsLoading(true);
        setTimeout(() => {
            setStep(step + 1);
            setIsLoading(false);
        }, 500);
    };

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error at Step {step}:</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        setError(null);
                        setStep(1);
                    }}
                >
                    <Text style={styles.buttonText}>Restart</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading Step {step}...</Text>
            </View>
        );
    }

    try {
        // Step 1: Basic navigation
        if (step === 1) {
            return (
                <SafeAreaView style={styles.safeArea}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen 
                                name="Home" 
                                component={HomeScreen}
                                options={{ title: 'Conecta Alicante' }}
                            />
                            <Stack.Screen 
                                name="Details" 
                                component={DetailsScreen}
                                options={{ title: 'Details' }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                    <View style={styles.debugInfo}>
                        <Text style={styles.debugText}>Step 1: Basic Navigation ✓</Text>
                        <TouchableOpacity 
                            style={styles.nextButton}
                            onPress={goToNextStep}
                        >
                            <Text style={styles.buttonText}>Next Step</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        // Step 2: Add SafeAreaProvider only
        if (step === 2) {
            return (
                <SafeAreaProvider>
                    <SafeAreaView style={styles.safeArea}>
                        <NavigationContainer>
                            <Stack.Navigator>
                                <Stack.Screen 
                                    name="Home" 
                                    component={HomeScreen}
                                    options={{ title: 'With SafeAreaProvider' }}
                                />
                                <Stack.Screen 
                                    name="Details" 
                                    component={DetailsScreen}
                                />
                            </Stack.Navigator>
                        </NavigationContainer>
                        <View style={styles.debugInfo}>
                            <Text style={styles.debugText}>Step 2: SafeAreaProvider Added ✓</Text>
                            <TouchableOpacity 
                                style={styles.nextButton}
                                onPress={goToNextStep}
                            >
                                <Text style={styles.buttonText}>Next Step</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </SafeAreaProvider>
            );
        }

        // Step 3: Add PaperProvider
        if (step === 3) {
            return (
                <SafeAreaProvider>
                    <PaperProvider>
                        <SafeAreaView style={styles.safeArea}>
                            <NavigationContainer>
                                <Stack.Navigator>
                                    <Stack.Screen 
                                        name="Home" 
                                        component={HomeScreen}
                                        options={{ title: 'With Paper Provider' }}
                                    />
                                    <Stack.Screen 
                                        name="Details" 
                                        component={DetailsScreen}
                                    />
                                </Stack.Navigator>
                            </NavigationContainer>
                            <View style={styles.debugInfo}>
                                <Text style={styles.debugText}>Step 3: PaperProvider Added ✓</Text>
                                <TouchableOpacity 
                                    style={styles.nextButton}
                                    onPress={goToNextStep}
                                >
                                    <Text style={styles.buttonText}>Next Step</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </PaperProvider>
                </SafeAreaProvider>
            );
        }

        // Step 4: Add App Context
        if (step === 4) {
            return (
                <SafeAreaProvider>
                    <AppProvider>
                        <PaperProvider>
                            <SafeAreaView style={styles.safeArea}>
                                <NavigationContainer>
                                    <Stack.Navigator>
                                        <Stack.Screen 
                                            name="Home" 
                                            component={HomeScreen}
                                            options={{ title: 'With App Context' }}
                                        />
                                        <Stack.Screen 
                                            name="Details" 
                                            component={DetailsScreen}
                                        />
                                    </Stack.Navigator>
                                </NavigationContainer>
                                <View style={styles.debugInfo}>
                                    <Text style={styles.debugText}>Step 4: AppProvider Added ✓</Text>
                                    <TouchableOpacity 
                                        style={styles.nextButton}
                                        onPress={goToNextStep}
                                    >
                                        <Text style={styles.buttonText}>Next Step</Text>
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                        </PaperProvider>
                    </AppProvider>
                </SafeAreaProvider>
            );
        }

        // Step 5: Add Theme Context
        if (step === 5) {
            return (
                <SafeAreaProvider>
                    <AppProvider>
                        <ThemeProvider>
                            <PaperProvider>
                                <SafeAreaView style={styles.safeArea}>
                                    <NavigationContainer>
                                        <Stack.Navigator>
                                            <Stack.Screen 
                                                name="Home" 
                                                component={HomeScreen}
                                                options={{ title: 'With Theme' }}
                                            />
                                            <Stack.Screen 
                                                name="Details" 
                                                component={DetailsScreen}
                                            />
                                        </Stack.Navigator>
                                    </NavigationContainer>
                                    <View style={styles.debugInfo}>
                                        <Text style={styles.debugText}>Step 5: ThemeProvider Added ✓</Text>
                                        <TouchableOpacity 
                                            style={styles.nextButton}
                                            onPress={goToNextStep}
                                        >
                                            <Text style={styles.buttonText}>Next Step</Text>
                                        </TouchableOpacity>
                                    </View>
                                </SafeAreaView>
                            </PaperProvider>
                        </ThemeProvider>
                    </AppProvider>
                </SafeAreaProvider>
            );
        }

        // Step 6: Add Auth Context
        if (step === 6) {
            return (
                <SafeAreaProvider>
                    <AppProvider>
                        <ThemeProvider>
                            <AuthProvider>
                                <PaperProvider>
                                    <SafeAreaView style={styles.safeArea}>
                                        <NavigationContainer>
                                            <Stack.Navigator>
                                                <Stack.Screen 
                                                    name="Home" 
                                                    component={HomeScreen}
                                                    options={{ title: 'With Auth' }}
                                                />
                                                <Stack.Screen 
                                                    name="Details" 
                                                    component={DetailsScreen}
                                                />
                                            </Stack.Navigator>
                                        </NavigationContainer>
                                        <View style={styles.debugInfo}>
                                            <Text style={styles.debugText}>Step 6: Auth Added ✓</Text>
                                            <Text style={styles.successText}>All core components working!</Text>
                                        </View>
                                    </SafeAreaView>
                                </PaperProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </AppProvider>
                </SafeAreaProvider>
            );
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>All steps completed!</Text>
                <Text style={styles.subtitle}>The app structure is working correctly</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setStep(1)}
                >
                    <Text style={styles.buttonText}>Restart Test</Text>
                </TouchableOpacity>
            </View>
        );
    } catch (err) {
        setError(err.message);
        return null;
    }
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
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1E3A8A',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 10,
        color: '#6B7280',
        fontSize: 16,
    },
    debugInfo: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    debugText: {
        fontSize: 14,
        color: '#10B981',
        marginBottom: 10,
    },
    successText: {
        fontSize: 16,
        color: '#10B981',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    nextButton: {
        backgroundColor: '#3B82F6',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
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

export default AppGradual;