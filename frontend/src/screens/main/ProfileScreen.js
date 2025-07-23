import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Avatar, List, Divider } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import { colors } from '../../constants/theme';
import { useAuth } from '../../store/contexts/AuthContext';
import { profileStyles as styles } from '../../styles/screens/main/ProfileScreenStyles';
import { devLog } from '../../utils';
import { showSuccessAlert } from '../../utils/alerts';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' },
        ]);
    };

    const menuItems = [
        {
            title: 'Account Settings',
            icon: 'account-cog',
            onPress: () => {
                devLog('Profile', 'Account settings tapped');
                showSuccessAlert('Coming Soon', 'Account settings will be available in the next update.');
            },
        },
        {
            title: 'Notifications',
            icon: 'bell-outline',
            onPress: () => {
                devLog('Profile', 'Notifications tapped');
                showSuccessAlert('Coming Soon', 'Notification settings will be available in the next update.');
            },
        },
        {
            title: 'Privacy Policy',
            icon: 'shield-check-outline',
            onPress: () => {
                devLog('Profile', 'Privacy policy tapped');
                showSuccessAlert('Coming Soon', 'Privacy policy will be available in the next update.');
            },
        },
        {
            title: 'Terms of Service',
            icon: 'file-document-outline',
            onPress: () => {
                devLog('Profile', 'Terms of service tapped');
                showSuccessAlert('Coming Soon', 'Terms of service will be available in the next update.');
            },
        },
        {
            title: 'Help & Support',
            icon: 'help-circle-outline',
            onPress: () => {
                devLog('Profile', 'Help & support tapped');
                showSuccessAlert('Coming Soon', 'Help & support will be available in the next update.');
            },
        },
        {
            title: 'About',
            icon: 'information-outline',
            onPress: () => {
                devLog('Profile', 'About tapped');
                showSuccessAlert('About', 'Conecta Alicante v1.0.0\nConnecting entrepreneurs and freelancers in Alicante.');
            },
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={user?.name?.charAt(0).toUpperCase() || 'U'}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.pathBadge}>
                    <Icon
                        name={user?.professionalPath === 'FREELANCER' ? 'laptop' : 'rocket-launch'}
                        size={16}
                        color={colors.primary}
                    />
                    <Text style={styles.pathText}>
                        {user?.professionalPath === 'FREELANCER' ? 'Freelancer' : 'Entrepreneur'}
                    </Text>
                </View>
            </View>

            <Card style={styles.menuCard}>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.title}>
                        <List.Item
                            title={item.title}
                            left={() => <List.Icon icon={item.icon} color={colors.primary} />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={item.onPress}
                            titleStyle={styles.menuItemTitle}
                        />
                        {index < menuItems.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Card>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
    );
};

export default ProfileScreen;
