
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { SCREEN_NAMES } from '../../constants/routes';
import { PROFESSIONAL_PATHS } from '../../constants/config';
import { colors } from '../../constants/theme';
import { styles } from '../../styles/screens/onboarding/PathSelectionScreenStyles';

const PathSelectionScreen = () => {
    const navigation = useNavigation();
    const { updateOnboardingPath } = useAuth(); // Use the correct function from context
    const [loading, setLoading] = React.useState(false);

    const handleSelectPath = async (path) => {
        setLoading(true);
        try {
            // Call the corrected context function
            await updateOnboardingPath(path);
            navigation.navigate(SCREEN_NAMES.PRIORITY_SELECTION, {
                professionalPath: path,
            });
        } catch (error) {
            console.error('Failed to select path:', error);
            // Optionally show an alert to the user
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>What brings you to Alicante?</Text>
                <Text style={styles.subtitle}>
                    Choose the path that best describes your professional goals.
                </Text>
            </View>

            <View style={styles.pathContainer}>
                <TouchableOpacity
                    style={styles.pathCard}
                    onPress={() => handleSelectPath(PROFESSIONAL_PATHS.FREELANCER)}
                >
                    <Icon name="briefcase-account" size={40} color={colors.primary} style={styles.pathIcon} />
                    <Text style={styles.pathTitle}>I'm a Freelancer</Text>
                    <Text style={styles.pathDescription}>
                        Looking to register as 'autónomo' and find clients.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.pathCard}
                    onPress={() => handleSelectPath(PROFESSIONAL_PATHS.ENTREPRENEUR)}
                >
                    <Icon name="lightbulb-on" size={40} color={colors.primary} style={styles.pathIcon} />
                    <Text style={styles.pathTitle}>I'm an Entrepreneur</Text>
                    <Text style={styles.pathDescription}>
                        Planning to start a company and build a team.
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PathSelectionScreen;
