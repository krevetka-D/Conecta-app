import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { register } from '../../app/slices/authSlice';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading, error, userRole } = useSelector((state) => state.auth);

    const handleRegister = () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        dispatch(register({ name, email, password, role: userRole }))
            .unwrap()
            .catch((err) => {
                Alert.alert('Registration Failed', err);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>As a {userRole}</Text>

            <AppTextInput placeholder="Full Name" value={name} onChangeText={setName} />
            <AppTextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <AppTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <AppButton
                title={loading ? 'Creating Account...' : 'Register'}
                onPress={handleRegister}
                disabled={loading}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: SIZES.large,
        backgroundColor: COLORS.white,
    },
    title: { ...FONTS.h1, textAlign: 'center', marginBottom: SIZES.base },
    subtitle: { ...FONTS.body, textAlign: 'center', color: COLORS.gray, marginBottom: SIZES.large },
});

export default RegisterScreen;