import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

const WelcomeScreen = ({ navigation }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                <Image
                    source={require('../../../assets/images/logo-white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Conecta Alicante</Text>
                <Text style={styles.subtitle}>
                    Your professional companion in Alicante
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Already have an account? Sign In
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        color: 'white',
        textAlign: 'center',
        marginBottom: 60,
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 30,
        marginBottom: 16,
    },
    primaryButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    secondaryButton: {
        paddingVertical: 16,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default WelcomeScreen;