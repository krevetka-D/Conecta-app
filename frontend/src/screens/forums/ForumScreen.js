// frontend/src/screens/forums/ForumsScreen.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Card, FAB, Portal, Modal, TextInput, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../store/contexts/AuthContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatting';
// Import the style FUNCTION
import { forumsStyles } from '../../styles/screens/forums/ForumScreenStyles';

const ForumsScreen = ({ navigation }) => {
    // 1. Get the theme object from the provider. This is now safe.
    const theme = useTheme();
    // 2. Create the styles at runtime by calling the function with the theme.
    const styles = forumsStyles(theme);

    const { user } = useAuth();
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadForums();
    }, []);

    const loadForums = useCallback(async () => {
        try {
            const data = await forumService.getForums();
            setForums(data || []);
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

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateForum = async () => {
        if (!validateForm()) return;

        try {
            await forumService.createForum(formData.title, formData.description);
            showSuccessAlert('Success', 'Forum created successfully!');
            setModalVisible(false);
            resetForm();
            loadForums();
        } catch (error) {
            console.error('Failed to create forum:', error);
            showErrorAlert('Error', error.message || 'Failed to create forum');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '' });
        setFormErrors({});
    };

    const handleForumPress = (forum) => {
        navigation.navigate('ForumDetail', { 
            forumId: forum._id, 
            forumTitle: forum.title 
        });
    };

    const renderForumItem = ({ item }) => {
        const threadCount = item.threads?.length || 0;
        const isMyForum = item.user?._id === user?._id;

        return (
            <TouchableOpacity onPress={() => handleForumPress(item)} activeOpacity={0.7}>
                <Card style={styles.forumCard}>
                    <Card.Content>
                        <View style={styles.forumHeader}>
                            <View style={styles.forumInfo}>
                                <Text style={styles.forumTitle}>{item.title}</Text>
                                <Text style={styles.forumDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                                <View style={styles.forumMeta}>
                                    <View style={styles.metaItem}>
                                        <Icon name="forum" size={16} color={theme.colors.textSecondary} />
                                        <Text style={styles.metaText}>
                                            {threadCount} {threadCount === 1 ? 'thread' : 'threads'}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="account" size={16} color={theme.colors.textSecondary} />
                                        <Text style={styles.metaText}>
                                            {item.user?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                        </View>
                        {isMyForum && (
                            <View style={styles.myForumBadge}>
                                <Text style={styles.myForumText}>Created by you</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    const categorizedForums = useMemo(() => {
        const categories = {
            general: [],
            freelancer: [],
            entrepreneur: [],
            social: [],
        };

        forums.forEach(forum => {
            const title = forum.title.toLowerCase();
            if (title.includes('freelancer') || title.includes('autónomo')) {
                categories.freelancer.push(forum);
            } else if (title.includes('entrepreneur') || title.includes('startup') || title.includes('founder')) {
                categories.entrepreneur.push(forum);
            } else if (title.includes('social') || title.includes('networking') || title.includes('meetup')) {
                categories.social.push(forum);
            } else {
                categories.general.push(forum);
            }
        });

        return categories;
    }, [forums]);

    const flatListData = useMemo(() => [
        { key: 'header', type: 'header' },
        ...Object.entries(categorizedForums).flatMap(([category, categoryForums]) => 
            categoryForums.length > 0 ? [
                { key: `${category}-header`, type: 'category-header', category },
                ...categoryForums.map(forum => ({ key: forum._id, type: 'forum', data: forum }))
            ] : []
        )
    ], [categorizedForums]);

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading forums..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={flatListData}
                renderItem={({ item }) => {
                    if (item.type === 'header') {
                        return (
                            <View style={styles.headerSection}>
                                <Text style={styles.headerTitle}>Community Forums</Text>
                                <Text style={styles.headerSubtitle}>
                                    Connect, ask questions, and share experiences
                                </Text>
                            </View>
                        );
                    }
                    if (item.type === 'category-header') {
                        const categoryIcons = {
                            general: 'forum',
                            freelancer: 'briefcase-account',
                            entrepreneur: 'rocket-launch',
                            social: 'account-group',
                        };
                        return (
                            <View style={styles.categoryHeader}>
                                <Icon 
                                    name={categoryIcons[item.category]} 
                                    size={20} 
                                    color={theme.colors.primary} 
                                />
                                <Text style={styles.categoryTitle}>
                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </Text>
                            </View>
                        );
                    }
                    return renderForumItem({ item: item.data });
                }}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading && forums.length === 0 && (
                        <EmptyState
                            icon="forum-outline"
                            title="No forums yet"
                            message="Be the first to create a forum and start a discussion!"
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
                    )
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                color={theme.colors.onPrimary} // Use theme color for icon
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Create New Forum</Text>
                    
                    <TextInput
                        label="Forum Title"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        mode="outlined"
                        style={styles.input}
                        error={!!formErrors.title}
                    />
                    {formErrors.title && (
                        <Text style={styles.errorText}>{formErrors.title}</Text>
                    )}
                    
                    <TextInput
                        label="Description"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                        error={!!formErrors.description}
                    />
                    {formErrors.description && (
                        <Text style={styles.errorText}>{formErrors.description}</Text>
                    )}
                    
                    <View style={styles.modalButtons}>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setModalVisible(false);
                                resetForm();
                            }}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateForum}
                            style={styles.modalButton}
                        >
                            Create Forum
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

export default React.memo(ForumsScreen);
