import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Card, Checkbox, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/AuthContext';
import { colors } from '../../constants/theme';
import { CHECKLIST_ITEMS } from '../../constants/config';
import checklistService from '../../services/checklistService';

const ChecklistScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [checklistData, setChecklistData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadChecklist();
    }, []);

    const loadChecklist = async () => {
        setLoading(true);
        try {
            const data = await checklistService.getChecklist();
            setChecklistData(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load checklist');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (itemKey, currentStatus) => {
        try {
            await checklistService.updateChecklistItem(itemKey, !currentStatus);
            await loadChecklist();
        } catch (error) {
            Alert.alert('Error', 'Failed to update checklist item');
        }
    };

    const getChecklistInfo = () => {
        const items = user?.professionalPath === 'FREELANCER'
            ? CHECKLIST_ITEMS.FREELANCER
            : CHECKLIST_ITEMS.ENTREPRENEUR;

        const completedCount = checklistData.filter(item => item.isCompleted).length;
        const progress = items.length > 0 ? completedCount / items.length : 0;

        return { items, completedCount, progress };
    };

    const { items, completedCount, progress } = getChecklistInfo();

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
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

            {/* Menu Items */}
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

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Version Info */}
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