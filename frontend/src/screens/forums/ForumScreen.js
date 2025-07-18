// frontend/src/screens/forums/ForumScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, Avatar, Menu, Divider } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatting';

const FORUM_CATEGORIES = [
    { key: 'all', label: 'All Forums', icon: 'forum', color: '#6366F1' },
    { key: 'general', label: 'General', icon: 'chat', color: '#10B981' },
    { key: 'freelancer', label: 'Freelancer', icon: 'briefcase-account', color: '#F59E0B' },
    { key: 'entrepreneur', label: 'Entrepreneur', icon: 'rocket-launch', color: '#EF4444' },
    { key: 'social', label: 'Social', icon: 'account-group', color: '#8B5CF6' },
    { key: 'help', label: 'Help & Support', icon: 'help-circle', color: '#06B6D4' },
];

const ForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

    // Create styles dynamically based on theme
    const styles = useMemo(() => ({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors?.background || '#F3F4F6',
        },
        container: {
            flex: 1,
            backgroundColor: theme.colors?.background || '#F3F4F6',
        },
        header: {
            marginBottom: theme.spacing?.l || 16,
            alignItems: 'center',
            padding: theme.spacing?.m || 16,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors?.text || '#111827',
            marginBottom: theme.spacing?.xs || 4,
        },
        headerSubtitle: {
            fontSize: 16,
            color: theme.colors?.textSecondary || '#6B7280',
            textAlign: 'center',
        },
        listContent: {
            padding: theme.spacing?.m || 16,
        },
        fab: {
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors?.primary || '#1E3A8A',
        },
        // Add other styles as needed
    }), [theme]);

    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [menuVisible, setMenuVisible] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        tags: [],
    });
    const [formErrors, setFormErrors] = useState({});
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadForums();
    }, []);

    const loadForums = useCallback(async () => {
        try {
            // Mock data for now since service might not be implemented
            const mockForums = [
                {
                    _id: '1',
                    title: 'General Discussion',
                    description: 'General discussions about living in Alicante',
                    category: 'general',
                    threads: [],
                    user: { _id: 'user1', name: 'Admin' },
                    updatedAt: new Date().toISOString(),
                    tags: ['general', 'discussion']
                }
            ];
            setForums(mockForums);
        } catch (error) {
            console.error('Failed to load forums:', error);
            if (!refreshing) {
                showErrorAlert('Error', 'Failed to load forums');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForums();
    }, [loadForums]);

    const renderForumItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ForumDetail', {
                forumId: item._id,
                forumTitle: item.title
            })}
            activeOpacity={0.7}
        >
            <Card style={{ marginBottom: 16 }}>
                <Card.Content>
                    <Text style={styles.headerTitle}>{item.title}</Text>
                    <Text style={styles.headerSubtitle}>{item.description}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading forums..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Community Forums</Text>
                    <Text style={styles.headerSubtitle}>
                        Connect, discuss, and share experiences
                    </Text>
                </View>

                <FlatList
                    data={forums}
                    renderItem={renderForumItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors?.primary || '#1E3A8A'}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="forum-outline"
                            title="No forums yet"
                            message="Be the first to create a forum!"
                            action={
                                <Button
                                    mode="contained"
                                    onPress={() => setModalVisible(true)}
                                    icon="plus"
                                >
                                    Create Forum
                                </Button>
                            }
                        />
                    }
                />

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                />
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ForumScreen);