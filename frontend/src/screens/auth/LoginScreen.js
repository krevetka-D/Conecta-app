// frontend/src/screens/auth/LoginScreen.js

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';

import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validateEmail, validatePassword } from '../../utils/validation';
import { showErrorAlert } from '../../utils/alerts';
import { loginStyles as styles } from '../../styles/screens/auth/LoginScreenStyles';
import { colors } from '../../constants/theme';
import { SCREEN_NAMES } from '../../constants/routes';

const LoginScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const { values, errors, handleChange, handleBlur, validateForm } = useForm({
        initialValues: {
            email: '',
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

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const handleLogin = useCallback(async () => {
        const isValid = validateForm();
        if (!isValid) return;

        setLoading(true);
        try {
            await login(values.email, values.password);
        } catch (error) {
            showErrorAlert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    }, [values, validateForm, login]);

    const navigateToRegister = useCallback(() => {
        navigation.navigate(SCREEN_NAMES.REGISTER);
    }, [navigation]);

    const inputTheme = useMemo(() => ({
        colors: { primary: colors.primary }
    }), []);

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
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    )}

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
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}

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
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default React.memo(LoginScreen);