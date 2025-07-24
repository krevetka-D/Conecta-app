import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Avatar, Card, Button, Chip } from 'react-native-paper';

import Icon from '../../components/common/Icon';
import { colors } from '../../constants/theme';
import userService from '../../services/userService';
import personalChatService from '../../services/personalChatService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { publicProfileStyles } from '../../styles/screens/profile/PublicProfileStyles';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { devLog, devError } from '../../utils/devLog';

const PublicProfileScreen = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const theme = useTheme();
    const styles = publicProfileStyles(theme);
    const { user: currentUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        setIsOwnProfile(userId === currentUser?._id);
        loadUserProfile();
    }, [userId]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await userService.getPublicProfile(userId);
            setProfileData(data);
            devLog('PublicProfile', 'Loaded profile data:', data);
        } catch (error) {
            devError('PublicProfile', 'Failed to load profile', error);
            showErrorAlert('Error', 'Failed to load user profile');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async () => {
        try {
            const chat = await personalChatService.createOrGetChat(userId);
            navigation.navigate('PersonalChat', {
                screen: 'PersonalChatDetail',
                params: {
                    chatId: chat._id,
                    userId: profileData._id,
                    userName: profileData.name
                }
            });
        } catch (error) {
            devError('PublicProfile', 'Failed to start chat', error);
            showErrorAlert('Error', 'Failed to start chat');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Profile not found</Text>
            </View>
        );
    }

    const getProfessionalIcon = (path) => {
        switch (path) {
            case 'STUDENT':
                return 'school';
            case 'FREELANCER':
                return 'briefcase';
            case 'ENTREPRENEUR':
                return 'rocket';
            default:
                return 'account';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Avatar.Text
                        size={100}
                        label={profileData.name?.[0]?.toUpperCase() || '?'}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profileData.name}</Text>
                    <Text style={styles.userEmail}>{profileData.email}</Text>
                    
                    <View style={styles.professionalBadge}>
                        <Icon 
                            name={getProfessionalIcon(profileData.professionalPath)} 
                            size={20} 
                            color={colors.primary} 
                        />
                        <Text style={styles.professionalText}>
                            {profileData.professionalPath || 'Not specified'}
                        </Text>
                    </View>

                    {profileData.bio && (
                        <Text style={styles.bio}>{profileData.bio}</Text>
                    )}
                </View>

                {/* Stats Section */}
                <Card style={styles.statsCard}>
                    <Card.Content>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {profileData.stats?.eventsAttended || 0}
                                </Text>
                                <Text style={styles.statLabel}>Events</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {profileData.stats?.forumsJoined || 0}
                                </Text>
                                <Text style={styles.statLabel}>Forums</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {profileData.memberSince ? 
                                        new Date(profileData.memberSince).getFullYear() : 
                                        'New'
                                    }
                                </Text>
                                <Text style={styles.statLabel}>Member Since</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Interests Section */}
                {profileData.interests && profileData.interests.length > 0 && (
                    <Card style={styles.interestsCard}>
                        <Card.Title title="Interests" />
                        <Card.Content>
                            <View style={styles.chipsContainer}>
                                {profileData.interests.map((interest, index) => (
                                    <Chip
                                        key={index}
                                        style={styles.interestChip}
                                        textStyle={styles.chipText}
                                    >
                                        {interest}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Skills Section */}
                {profileData.skills && profileData.skills.length > 0 && (
                    <Card style={styles.skillsCard}>
                        <Card.Title title="Skills" />
                        <Card.Content>
                            <View style={styles.chipsContainer}>
                                {profileData.skills.map((skill, index) => (
                                    <Chip
                                        key={index}
                                        style={styles.skillChip}
                                        textStyle={styles.chipText}
                                    >
                                        {skill}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && (
                    <View style={styles.actionButtons}>
                        <Button
                            mode="contained"
                            onPress={handleStartChat}
                            icon="message"
                            style={styles.chatButton}
                        >
                            Send Message
                        </Button>
                    </View>
                )}

                {isOwnProfile && (
                    <View style={styles.actionButtons}>
                        <Button
                            mode="outlined"
                            onPress={() => navigation.navigate('EditProfile')}
                            icon="pencil"
                            style={styles.editButton}
                        >
                            Edit Profile
                        </Button>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PublicProfileScreen;