import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Card, Avatar, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/AuthContext';
import { colors } from '../../constants/theme';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: 'white',
    },
    avatar: {
        backgroundColor: colors.primary,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 12,
    },
    pathBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pathText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.primary,
        marginLeft: 6,
    },
    menuCard: {
        margin: 16,
        borderRadius: 12,
    },
    menuItemTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        paddingVertical: 12,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.error,
        marginLeft: 8,
    },
    versionText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
});

export default ProfileScreen;