// frontend/src/screens/auth/RegisterScreen.js

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { TextInput, RadioButton, Card } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';

import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import {
    validateEmail,
    validatePassword,
    validateName,
} from '../../utils/validation';
import { showErrorAlert } from '../../utils/alerts';
import { registerStyles as styles } from '../../styles/screens/auth/RegisterScreenStyles';
import { colors } from '../../constants/theme';
import { SCREEN_NAMES } from '../../constants/routes';
import { PROFESSIONAL_PATHS } from '../../constants/config';

const RegisterScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState('');
    const { register } = useAuth();

    const { values, errors, handleChange, handleBlur, validateForm, setErrors } = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationRules: {
            name: (value) => {
                if (!value) return 'Name is required';
                if (!validateName(value))
                    return 'Name must be at least 2 characters';
                return null;
            },
            email: (value) => {
                if (!value) return 'Email is required';
                if (!validateEmail(value)) return 'Invalid email format';
                return null;
            },
            password: (value) => {
                if (!value) return 'Password is required';
                if (!validatePassword(value))
                    return 'Password must be at least 6 characters';
                return null;
            },
            confirmPassword: (value) => {
                if (!value) return 'Please confirm your password';
                if (value !== values.password) return 'Passwords do not match';
                return null;
            },
        },
    });

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleRegister = useCallback(async () => {
        // Validate form fields
        const isValid = validateForm();
        
        // Check if professional path is selected
        if (!selectedPath) {
            setErrors(prev => ({ ...prev, professionalPath: 'Please select your professional path' }));
            return;
        }
        
        if (!isValid) return;

        setLoading(true);
        try {
            // Create user object with professional path
            const userData = {
                name: values.name,
                email: values.email,
                password: values.password,
                professionalPath: selectedPath,
            };
            
            await register(userData.name, userData.email, userData.password, userData.professionalPath);
            // Navigation will be handled by AuthContext after successful registration
        } catch (error) {
            showErrorAlert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    }, [values, validateForm, register, selectedPath, setErrors]);

    const navigateToLogin = useCallback(() => {
        navigation.navigate(SCREEN_NAMES.LOGIN);
    }, [navigation]);

    const inputTheme = useMemo(() => ({
        colors: { primary: colors.primary },
    }), []);

    const handlePathSelection = useCallback((path) => {
        setSelectedPath(path);
        // Clear professional path error if it exists
        if (errors.professionalPath) {
            setErrors(prev => ({ ...prev, professionalPath: null }));
        }
    }, [errors.professionalPath, setErrors]);

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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join the Alicante professional community
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        mode="outlined"
                        style={styles.input}
                        theme={inputTheme}
                        error={!!errors.name}
                        disabled={loading}
                    />
                    {errors.name && (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    )}

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
                        autoComplete="new-password"
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

                    <TextInput
                        label="Confirm Password"
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                        textContentType="password"
                        style={styles.input}
                        theme={inputTheme}
                        error={!!errors.confirmPassword}
                        disabled={loading}
                    />
                    {errors.confirmPassword && (
                        <Text style={styles.errorText}>
                            {errors.confirmPassword}
                        </Text>
                    )}

                    {/* Professional Path Selection */}
                    <View style={styles.pathSection}>
                        <Text style={styles.pathTitle}>What brings you to Alicante?</Text>
                        <Text style={styles.pathSubtitle}>Choose your professional path</Text>
                        
                        <RadioButton.Group 
                            onValueChange={handlePathSelection} 
                            value={selectedPath}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.pathCard,
                                    selectedPath === PROFESSIONAL_PATHS.FREELANCER && styles.pathCardSelected,
                                    errors.professionalPath && styles.pathCardError
                                ]}
                                onPress={() => handlePathSelection(PROFESSIONAL_PATHS.FREELANCER)}
                                disabled={loading}
                            >
                                <View style={styles.pathCardContent}>
                                    <RadioButton
                                        value={PROFESSIONAL_PATHS.FREELANCER}
                                        color={colors.primary}
                                        disabled={loading}
                                    />
                                    <View style={styles.pathCardTextContainer}>
                                        <View style={styles.pathCardHeader}>
                                            <Icon name="briefcase-account" size={24} color={colors.primary} />
                                            <Text style={styles.pathCardTitle}>Freelancer / Remote Worker</Text>
                                        </View>
                                        <Text style={styles.pathCardDescription}>
                                            Register as autónomo, manage clients, and track your freelance business
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.pathCard,
                                    selectedPath === PROFESSIONAL_PATHS.ENTREPRENEUR && styles.pathCardSelected,
                                    errors.professionalPath && styles.pathCardError
                                ]}
                                onPress={() => handlePathSelection(PROFESSIONAL_PATHS.ENTREPRENEUR)}
                                disabled={loading}
                            >
                                <View style={styles.pathCardContent}>
                                    <RadioButton
                                        value={PROFESSIONAL_PATHS.ENTREPRENEUR}
                                        color={colors.primary}
                                        disabled={loading}
                                    />
                                    <View style={styles.pathCardTextContainer}>
                                        <View style={styles.pathCardHeader}>
                                            <Icon name="rocket-launch" size={24} color={colors.primary} />
                                            <Text style={styles.pathCardTitle}>Entrepreneur / Founder</Text>
                                        </View>
                                        <Text style={styles.pathCardDescription}>
                                            Form a company, find funding, and build your startup in Spain
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </RadioButton.Group>
                        
                        {errors.professionalPath && (
                            <Text style={styles.errorText}>{errors.professionalPath}</Text>
                        )}
                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        fullWidth
                    />

                    <TouchableOpacity
                        onPress={navigateToLogin}
                        style={styles.linkContainer}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>
                            Already have an account?{' '}
                            <Text style={styles.linkBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default React.memo(RegisterScreen);