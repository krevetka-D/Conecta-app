import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/theme';
import { PROFESSIONAL_PATHS } from '../../constants/config';

const PathSelectionScreen = ({ navigation }) => {
    const [selectedPath, setSelectedPath] = useState(null);

    const paths = [
        {
            id: PROFESSIONAL_PATHS.FREELANCER,
            title: "I'm a Freelancer, Remote Worker, or Digital Nomad",
            icon: 'laptop',
            description: 'Working independently, managing clients, and building your business',
        },
        {
            id: PROFESSIONAL_PATHS.ENTREPRENEUR,
            title: "I'm an Entrepreneur or Founder",
            icon: 'rocket-launch',
            description: 'Building a startup, forming a company, and scaling your business',
        },
    ];

    const handleContinue = () => {
        if (selectedPath) {
            navigation.navigate('PrioritySelection', { professionalPath: selectedPath });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>What's your professional focus in Alicante?</Text>
                    <Text style={styles.subtitle}>
                        We'll customize your experience based on your needs
                    </Text>
                </View>

                <View style={styles.pathContainer}>
                    {paths.map((path) => (
                        <TouchableOpacity
                            key={path.id}
                            style={[
                                styles.pathCard,
                                selectedPath === path.id && styles.pathCardSelected,
                            ]}
                            onPress={() => setSelectedPath(path.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.pathIconContainer}>
                                <Icon
                                    name={path.icon}
                                    size={40}
                                    color={selectedPath === path.id ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.pathTextContainer}>
                                <Text style={[
                                    styles.pathTitle,
                                    selectedPath === path.id && styles.pathTitleSelected,
                                ]}>
                                    {path.title}
                                </Text>
                                <Text style={styles.pathDescription}>{path.description}</Text>
                            </View>
                            {selectedPath === path.id && (
                                <Icon name="check-circle" size={24} color={colors.primary} style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, !selectedPath && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedPath}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        lineHeight: 24,
    },
    pathContainer: {
        flex: 1,
    },
    pathCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    pathCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#F0F9FF',
    },
    pathIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    pathTextContainer: {
        flex: 1,
    },
    pathTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 4,
    },
    pathTitleSelected: {
        color: colors.primary,
    },
    pathDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        lineHeight: 20,
    },
    checkIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    continueButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 40,
    },
    continueButtonDisabled: {
        backgroundColor: colors.textSecondary,
        opacity: 0.5,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
});

export default PathSelectionScreen;