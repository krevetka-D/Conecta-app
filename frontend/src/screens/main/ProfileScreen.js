// frontend/src/screens/main/ProfileScreen.js

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Card, Avatar, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import { profileStyles as styles } from '../../styles/screens/main/ProfileScreenStyles';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]
        );
    };

    const menuItems = [
        {
            title: 'Account Settings',
            icon: 'account-cog',
            onPress: () => console.log('Account settings'),
        },
        {
            title: 'Notifications',
            icon: 'bell-outline',
            onPress: () => console.log('Notifications'),
        },
        {
            title: 'Privacy Policy',
            icon: 'shield-check-outline',
            onPress: () => console.log('Privacy policy'),
        },
        {
            title: 'Terms of Service',
            icon: 'file-document-outline',
            onPress: () => console.log('Terms of service'),
        },
        {
            title: 'Help & Support',
            icon: 'help-circle-outline',
            onPress: () => console.log('Help & support'),
        },
        {
            title: 'About',
            icon: 'information-outline',
            onPress: () => console.log('About'),
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