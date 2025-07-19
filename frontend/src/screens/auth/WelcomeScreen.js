
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { welcomeStyles as styles } from '../../styles/screens/auth/WelcomeScreenStyles';
import { colors } from '../../constants/theme';
import { SCREEN_NAMES } from '../../constants/routes';

const WelcomeScreen = ({ navigation }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Conecta Alicante</Text>
                <Text style={styles.subtitle}>
                    Your professional companion in Alicante
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate(SCREEN_NAMES.REGISTER)}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}
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

export default WelcomeScreen;