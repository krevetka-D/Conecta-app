// frontend/src/screens/auth/RegisterScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { showErrorAlert } from '../../utils/alerts';
import { registerStyles as styles } from '../../styles/screens/auth/RegisterScreenStyles';
import { colors } from '../../constants/theme';
import { SCREEN_NAMES } from '../../constants/routes';
import { PROFESSIONAL_PATHS } from '../../constants/config';

const CHECKLIST_ITEMS = {
    FREELANCER: [
        { key: 'OBTAIN_NIE', title: 'Obtain your NIE', description: 'Get your foreigner identification number' },
        { key: 'REGISTER_AUTONOMO', title: 'Register as Autónomo', description: 'Complete your self-employment registration' },
        { key: 'UNDERSTAND_TAXES', title: 'Understand Tax Obligations', description: 'Learn about IVA and IRPF requirements' },
        { key: 'OPEN_BANK_ACCOUNT', title: 'Open Spanish Bank Account', description: 'Set up your business banking' },
    ],
    ENTREPRENEUR: [
        { key: 'OBTAIN_NIE', title: 'Obtain your NIE', description: 'Get your foreigner identification number' },
        { key: 'FORM_SL_COMPANY', title: 'Form an S.L. Company', description: 'Establish your limited liability company' },
        { key: 'GET_COMPANY_NIF', title: 'Get Company NIF', description: 'Obtain your company tax ID' },
        { key: 'RESEARCH_FUNDING', title: 'Research Funding Options', description: 'Explore grants and investment opportunities' },
    ],
};

const RegisterScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedChecklistItems, setSelectedChecklistItems] = useState([]);
    const [showChecklistSelection, setShowChecklistSelection] = useState(false);
    const { register } = useAuth();

    const { values, errors, handleChange, handleBlur, validateForm, setErrors } = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
        },
        validationRules: {
            name: (value) => {
                if (!value) return 'Name is required';
                if (!validateName(value)) return 'Name must be at least 2 characters';
                return null;
            },
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

    const handlePathSelection = useCallback((path) => {
        setSelectedPath(path);
        setShowChecklistSelection(false);
        setSelectedChecklistItems([]);
    }, []);

    const toggleChecklistItem = useCallback((itemKey) => {
        setSelectedChecklistItems(prev => {
            if (prev.includes(itemKey)) {
                return prev.filter(key => key !== itemKey);
            } else {
                return [...prev, itemKey];
            }
        });
    }, []);

    const handleNext = useCallback(() => {
        const isValid = validateForm();
        if (!isValid) return;

        if (!selectedPath) {
            setErrors(prev => ({ ...prev, professionalPath: 'Please select your professional path' }));
            return;
        }

        setShowChecklistSelection(true);
    }, [values, selectedPath, validateForm, setErrors]);

    const handleBack = useCallback(() => {
        setShowChecklistSelection(false);
    }, []);

    const handleRegister = useCallback(async () => {
        if (selectedChecklistItems.length === 0) {
            showErrorAlert('Select Priorities', 'Please select at least one checklist item to get started.');
            return;
        }

        setLoading(true);
        try {
            // Trim and lowercase email for consistency
            const trimmedEmail = values.email.trim().toLowerCase();
            
            // Create user object with professional path
            const userData = {
                name: values.name.trim(),
                email: trimmedEmail,
                password: values.password,
                professionalPath: selectedPath,
            };
            
            // Register the user
            await register(userData.name, userData.email, userData.password, userData.professionalPath);
            
            // Store selected checklist items in AsyncStorage for later use
            await AsyncStorage.setItem('pendingChecklistItems', JSON.stringify(selectedChecklistItems));
            
            // The auth context will handle navigation after successful registration
        } catch (error) {
            console.error('Registration error details:', error);
            
            // Handle specific error cases
            if (error.message) {
                const errorMessage = error.message.toLowerCase();
                
                if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                    // User already exists error
                    setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
                    setShowChecklistSelection(false); // Go back to the form
                    
                    Alert.alert(
                        'Email Already Registered',
                        'This email address is already associated with an account. Would you like to sign in instead?',
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel'
                            },
                            {
                                text: 'Go to Login',
                                onPress: () => navigation.navigate(SCREEN_NAMES.LOGIN, { 
                                    email: values.email.trim().toLowerCase() 
                                })
                            }
                        ]
                    );
                } else if (errorMessage.includes('invalid email')) {
                    // Invalid email format
                    setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                    setShowChecklistSelection(false);
                    showErrorAlert('Invalid Email', 'Please check your email address and try again.');
                } else if (errorMessage.includes('password')) {
                    // Password related error
                    setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
                    setShowChecklistSelection(false);
                    showErrorAlert('Invalid Password', 'Your password must be at least 6 characters long.');
                } else if (errorMessage.includes('network')) {
                    // Network error
                    showErrorAlert(
                        'Network Error', 
                        'Please check your internet connection and try again.'
                    );
                } else {
                    // Generic error
                    showErrorAlert(
                        'Registration Failed', 
                        error.message || 'An error occurred during registration. Please try again.'
                    );
                }
            } else {
                // Fallback for unknown errors
                showErrorAlert(
                    'Registration Failed', 
                    'An unexpected error occurred. Please try again later.'
                );
            }
        } finally {
            setLoading(false);
        }
    }, [values, register, selectedPath, selectedChecklistItems, navigation, setErrors]);

    const navigateToLogin = useCallback(() => {
        navigation.navigate(SCREEN_NAMES.LOGIN);
    }, [navigation]);

    const checklistItems = selectedPath === PROFESSIONAL_PATHS.FREELANCER 
        ? CHECKLIST_ITEMS.FREELANCER 
        : CHECKLIST_ITEMS.ENTREPRENEUR;

    const inputTheme = { colors: { primary: colors.primary } };

    if (showChecklistSelection) {
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
                        <Text style={styles.title}>Select Your Priorities</Text>
                        <Text style={styles.subtitle}>
                            Choose the items you want to track on your dashboard
                        </Text>
                    </View>

                    <View style={styles.checklistContainer}>
                        {checklistItems.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.checklistCard,
                                    selectedChecklistItems.includes(item.key) && styles.checklistCardSelected
                                ]}
                                onPress={() => toggleChecklistItem(item.key)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.checklistCardContent}>
                                    <Checkbox.Android
                                        status={selectedChecklistItems.includes(item.key) ? 'checked' : 'unchecked'}
                                        color={colors.primary}
                                    />
                                    <View style={styles.checklistTextContainer}>
                                        <Text style={styles.checklistTitle}>{item.title}</Text>
                                        <Text style={styles.checklistDescription}>{item.description}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            title="Back"
                            onPress={handleBack}
                            variant="outline"
                            style={styles.backButton}
                            disabled={loading}
                        />
                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading || selectedChecklistItems.length === 0}
                            style={styles.nextButton}
                            fullWidth={false}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

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
                    <Text style={styles.subtitle}>Join our professional community</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        mode="outlined"
                        autoComplete="name"
                        textContentType="name"
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
                        autoComplete="password-new"
                        textContentType="newPassword"
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

                    <View style={styles.pathSection}>
                        <Text style={styles.pathTitle}>I am a...</Text>
                        <Text style={styles.pathSubtitle}>Choose your professional path</Text>
                        
                        <RadioButton.Group
                            onValueChange={handlePathSelection}
                            value={selectedPath}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.pathCard,
                                    selectedPath === PROFESSIONAL_PATHS.FREELANCER && styles.pathCardSelected,
                                    errors.professionalPath && !selectedPath && styles.pathCardError
                                ]}
                                onPress={() => handlePathSelection(PROFESSIONAL_PATHS.FREELANCER)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.pathCardContent}>
                                    <RadioButton.Android
                                        value={PROFESSIONAL_PATHS.FREELANCER}
                                        color={colors.primary}
                                    />
                                    <View style={styles.pathCardTextContainer}>
                                        <Text style={styles.pathCardTitle}>Freelancer</Text>
                                        <Text style={styles.pathCardDescription}>
                                            Working independently as autónomo
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.pathCard,
                                    selectedPath === PROFESSIONAL_PATHS.ENTREPRENEUR && styles.pathCardSelected,
                                    errors.professionalPath && !selectedPath && styles.pathCardError
                                ]}
                                onPress={() => handlePathSelection(PROFESSIONAL_PATHS.ENTREPRENEUR)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.pathCardContent}>
                                    <RadioButton.Android
                                        value={PROFESSIONAL_PATHS.ENTREPRENEUR}
                                        color={colors.primary}
                                    />
                                    <View style={styles.pathCardTextContainer}>
                                        <Text style={styles.pathCardTitle}>Entrepreneur</Text>
                                        <Text style={styles.pathCardDescription}>
                                            Starting or running a business
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </RadioButton.Group>
                        
                        {errors.professionalPath && !selectedPath && (
                            <Text style={styles.errorText}>{errors.professionalPath}</Text>
                        )}
                    </View>

                    <Button
                        title="Next"
                        onPress={handleNext}
                        disabled={loading || !selectedPath}
                        style={styles.button}
                        fullWidth
                    />

                    <TouchableOpacity
                        onPress={navigateToLogin}
                        style={styles.linkContainer}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default React.memo(RegisterScreen);