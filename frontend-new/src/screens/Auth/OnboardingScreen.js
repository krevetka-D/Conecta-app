import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setUserRole } from '../../app/slices/authSlice';
import AppButton from '../../components/common/AppButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

const OnboardingScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    const handleSelectRole = (role) => {
        dispatch(setUserRole(role));
        navigation.navigate(ROUTES.REGISTER);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Welcome to Conecta Alicante</Text>
            <Text style={styles.subtitle}>Choose your path to get started</Text>

            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectRole('freelancer')}>
                    <Text style={styles.optionTitle}>Freelancer or Coworker</Text>
                    <Text style={styles.optionDescription}>For independent professionals and remote workers.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectRole('entrepreneur')}>
                    <Text style={styles.optionTitle}>Entrepreneur or Founder</Text>
                    <Text style={styles.optionDescription}>For those building the next big thing.</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <AppButton title="Login" onPress={() => navigation.navigate(ROUTES.LOGIN)} type="secondary" textStyle={{ color: COLORS.primary }}/>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.medium,
    },
    title: { ...FONTS.h1, color: COLORS.black, marginBottom: SIZES.base, textAlign: 'center' },
    subtitle: { ...FONTS.body, color: COLORS.gray, marginBottom: SIZES.xlarge, textAlign: 'center' },
    optionsContainer: { width: '100%' },
    optionCard: {
        backgroundColor: COLORS.lightGray,
        padding: SIZES.large,
        borderRadius: SIZES.base,
        alignItems: 'center',
        marginBottom: SIZES.medium,
    },
    optionTitle: { ...FONTS.h3, marginBottom: SIZES.base },
    optionDescription: { ...FONTS.body, color: COLORS.gray, textAlign: 'center' },
    footer: { position: 'absolute', bottom: 40, width: '80%', alignItems: 'center' },
    loginText: { ...FONTS.body, color: COLORS.gray, marginBottom: SIZES.small },
});

export default OnboardingScreen;