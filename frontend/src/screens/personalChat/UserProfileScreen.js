// frontend/src/screens/personalChat/UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    Alert,
} from 'react-native';
import { Card, Avatar, Button, Chip } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';

import { useAuth } from '../../store/contexts/AuthContext';
import { colors, spacing, fonts } from '../../constants/theme';
import personalChatService from '../../services/personalChatService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { SCREEN_NAMES } from '../../constants/routes';

const UserProfileScreen = ({ route, navigation }) => {
    const { user: currentUser } = useAuth();
    const { userId, userName } = route.params;
    
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, [userId]);

    const loadUserProfile = async () => {
        try {
            const profile = await personalChatService.getUserProfile(userId);
            setUserProfile(profile);
            setIsBlocked(profile.isBlocked || false);
        } catch (error) {
            console.error('Failed to load user profile:', error);
            showErrorAlert('Error', 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async () => {
        try {
            // Start or get existing conversation
            const conversation = await personalChatService.startConversation(userId);
            
            // Navigate to chat detail
            navigation.replace(SCREEN_NAMES.PERSONAL_CHAT_DETAIL, {
                userId: userId,
                userName: userName || userProfile?.name,
                conversationId: conversation.conversationId,
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            showErrorAlert('Error', 'Failed to start conversation');
        }
    };

    const handleBlockUser = async () => {
        Alert.alert(
            isBlocked ? 'Unblock User' : 'Block User',
            isBlocked 
                ? `Are you sure you want to unblock ${userName}?`
                : `Are you sure you want to block ${userName}? You won't receive messages from them.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: isBlocked ? 'Unblock' : 'Block', 
                    style: isBlocked ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            await personalChatService.toggleBlockUser(userId, !isBlocked);
                            setIsBlocked(!isBlocked);
                            showSuccessAlert(
                                'Success', 
                                isBlocked ? 'User unblocked' : 'User blocked'
                            );
                        } catch (error) {
                            showErrorAlert('Error', 'Failed to update block status');
                        }
                    }
                },
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading profile..." />;
    }

    if (!userProfile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>User profile not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Card style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Avatar.Text 
                            size={100} 
                            label={userProfile.name.charAt(0).toUpperCase()} 
                            style={styles.avatar}
                        />
                        <Text style={styles.userName}>{userProfile.name}</Text>
                        <Text style={styles.userEmail}>{userProfile.email}</Text>
                        
                        <View style={styles.statusContainer}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: userProfile.isOnline ? colors.success : colors.textSecondary }
                            ]} />
                            <Text style={styles.statusText}>
                                {userProfile.isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>

                        <Chip
                            style={styles.pathChip}
                            textStyle={styles.pathChipText}
                            icon={userProfile.professionalPath === 'FREELANCER' ? 'briefcase' : 'rocket'}
                        >
                            {userProfile.professionalPath === 'FREELANCER' ? 'Freelancer' : 'Entrepreneur'}
                        </Chip>
                    </View>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText}>
                            {userProfile.bio || 'No bio available'}
                        </Text>
                        
                        {userProfile.location && (
                            <View style={styles.infoRow}>
                                <Icon name="map-marker" size={20} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{userProfile.location}</Text>
                            </View>
                        )}
                        
                        {userProfile.joinedDate && (
                            <View style={styles.infoRow}>
                                <Icon name="calendar" size={20} color={colors.textSecondary} />
                                <Text style={styles.infoText}>
                                    Joined {new Date(userProfile.joinedDate).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                <View style={styles.actionButtons}>
                    <Button
                        mode="contained"
                        onPress={handleStartChat}
                        style={styles.chatButton}
                        icon="message"
                        disabled={isBlocked}
                    >
                        Start Chatting
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={handleBlockUser}
                        style={styles.blockButton}
                        textColor={isBlocked ? colors.primary : colors.error}
                        icon={isBlocked ? "account-check" : "account-cancel"}
                    >
                        {isBlocked ? 'Unblock User' : 'Block User'}
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileCard: {
        margin: spacing.md,
        backgroundColor: colors.surface,
    },
    profileHeader: {
        alignItems: 'center',
        padding: spacing.lg,
    },
    avatar: {
        backgroundColor: colors.primary,
        marginBottom: spacing.md,
    },
    userName: {
        fontSize: fonts.sizes.xxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.xs,
    },
    statusText: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
    },
    pathChip: {
        backgroundColor: colors.primaryLight + '20',
    },
    pathChipText: {
        color: colors.primary,
        fontSize: fonts.sizes.sm,
    },
    infoCard: {
        margin: spacing.md,
        marginTop: 0,
        backgroundColor: colors.surface,
    },
    sectionTitle: {
        fontSize: fonts.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    bioText: {
        fontSize: fonts.sizes.md,
        color: colors.text,
        lineHeight: fonts.sizes.md * 1.5,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    infoText: {
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    actionButtons: {
        padding: spacing.md,
        paddingTop: 0,
    },
    chatButton: {
        marginBottom: spacing.md,
    },
    blockButton: {
        borderColor: colors.error,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: fonts.sizes.lg,
        color: colors.textSecondary,
    },
});

export default React.memo(UserProfileScreen);