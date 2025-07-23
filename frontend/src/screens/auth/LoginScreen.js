// frontend/src/screens/auth/LoginScreen.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';

import { Button } from '../../components/ui/Button';
import { SCREEN_NAMES } from '../../constants/routes';
import { colors } from '../../constants/theme';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../store/contexts/AuthContext';
import { loginStyles as styles } from '../../styles/screens/auth/LoginScreenStyles';
import { showErrorAlert } from '../../utils/alerts';
import { validateEmail, validatePassword } from '../../utils/validation';
import { devError } from '../../utils';

const LoginScreen = ({ navigation, route }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // Get email from navigation params if coming from registration
    const emailFromParams = route.params?.email || '';

    const { values, errors, handleChange, handleBlur, validateForm, setValues } = useForm({
        initialValues: {
            email: emailFromParams,
            password: '',
        },
        validationRules: {
            email: (value) => {
                if (!value) return 'Email is required';
                if (!validateEmail(value)) return 'Invalid email format';
                return null;
            },
            password: (value) => {
                if (!value) return 'Password is required';
                if (!validatePassword(value)) return 'Password must be at least 6 characters';
                return null;
            },
        },
    });

    // Update email if navigated with params
    useEffect(() => {
        if (emailFromParams) {
            setValues((prev) => ({ ...prev, email: emailFromParams }));
        }
    }, [emailFromParams, setValues]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleLogin = useCallback(async () => {
        const isValid = validateForm();
        if (!isValid) return;

        setLoading(true);
        try {
            await login(values.email.trim().toLowerCase(), values.password);
            // Navigation will be handled by AuthContext after successful login
        } catch (error) {
            devError('Login', 'Login error', error);

            // Handle specific error messages
            const errorMessage = error.message?.toLowerCase() || '';

            if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
                showErrorAlert(
                    'Login Failed',
                    'The email or password you entered is incorrect. Please try again.',
                );
            } else if (
                errorMessage.includes('not found') ||
                errorMessage.includes('doesn\'t exist')
            ) {
                Alert.alert(
                    'Account Not Found',
                    'No account found with this email address. Would you like to create one?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Sign Up',
                            onPress: () =>
                                navigation.navigate(SCREEN_NAMES.REGISTER, {
                                    email: values.email.trim().toLowerCase(),
                                }),
                        },
                    ],
                );
            } else if (errorMessage.includes('network')) {
                showErrorAlert(
                    'Network Error',
                    'Please check your internet connection and try again.',
                );
            } else if (errorMessage.includes('many attempts') || errorMessage.includes('locked')) {
                showErrorAlert(
                    'Account Locked',
                    'Too many failed login attempts. Please try again later or reset your password.',
                );
            } else {
                showErrorAlert(
                    'Login Failed',
                    error.message || 'An error occurred. Please try again.',
                );
            }
        } finally {
            setLoading(false);
        }
    }, [values, validateForm, login, navigation]);

    const navigateToRegister = useCallback(() => {
        navigation.navigate(SCREEN_NAMES.REGISTER, {
            email: values.email.trim().toLowerCase(),
        });
    }, [navigation, values.email]);

    const showTestCredentials = useCallback(() => {
        Alert.alert(
            'Test Credentials',
            'Email: test@example.com\nPassword: test123\n\nNote: You need to run the createTestUser script in the backend first.',
            [
                {
                    text: 'Copy Email',
                    onPress: () => {
                        setValues((prev) => ({ ...prev, email: 'test@example.com' }));
                    },
                },
                { text: 'OK' },
            ],
        );
    }, [setValues]);

    const inputTheme = useMemo(
        () => ({
            colors: { primary: colors.primary },
        }),
        [],
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        style={styles.input}
                        theme={inputTheme}
                        error={!!errors.email}
                        disabled={loading}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    <TextInput
                        label="Password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        textContentType="password"
                        style={styles.input}
                        theme={inputTheme}
                        error={!!errors.password}
                        disabled={loading}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={togglePasswordVisibility}
                                disabled={loading}
                            />
                        }
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        fullWidth
                    />

                    <TouchableOpacity
                        onPress={navigateToRegister}
                        style={styles.linkContainer}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>

                    {__DEV__ && (
                        <TouchableOpacity
                            onPress={showTestCredentials}
                            style={[styles.linkContainer, { marginTop: 20 }]}
                            disabled={loading}
                        >
                            <Text style={[styles.linkText, { color: colors.info }]}>
                                Show Test Credentials
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default React.memo(LoginScreen);
