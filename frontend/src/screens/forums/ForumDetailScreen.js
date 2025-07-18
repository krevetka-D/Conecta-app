// frontend/src/screens/forums/ForumDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Card, FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatting';
import { forumDetailStyles } from '../../styles/screens/forums/ForumDetailScreenStyles';

const ForumDetailScreen = ({ route, navigation }) => {
    const theme = useTheme();
    const styles = forumDetailStyles(theme);
    const { user } = useAuth();
    const { forumId, forumTitle } = route.params;

    const [forum, setForum] = useState(null);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadForumDetail();
    }, [forumId]);

    const loadForumDetail = useCallback(async () => {
        try {
            const data = await forumService.getForumDetail(forumId);
            setForum(data);
            setThreads(data.threads || []);
        } catch (error) {
            console.error('Failed to load forum details:', error);
            if (!refreshing) {
                showErrorAlert('Error', 'Failed to load forum details');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [forumId, refreshing]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForumDetail();
    }, [loadForumDetail]);

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.content.trim()) errors.content = 'Content is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateThread = async () => {
        if (!validateForm()) return;

        try {
            await forumService.createThread(forumId, formData.title, formData.content);
            showSuccessAlert('Success', 'Thread created successfully!');
            setModalVisible(false);
            resetForm();
            loadForumDetail();
        } catch (error) {
            console.error('Failed to create thread:', error);
            showErrorAlert('Error', error.message || 'Failed to create thread');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', content: '' });
        setFormErrors({});
    };

    const handleThreadPress = (thread) => {
        navigation.navigate('ThreadDetail', { 
            threadId: thread._id, 
            threadTitle: thread.title 
        });
    };
    
const handleDeleteThread = async (threadId, threadTitle) => {
        showConfirmAlert(
            'Delete Thread',
            `Are you sure you want to delete "${threadTitle}"? This action cannot be undone.`,
            async () => {
                try {
                    await forumService.deleteThread(threadId);
                    showSuccessAlert('Success', 'Thread deleted successfully');
                    loadForumDetail();
                } catch (error) {
                    showErrorAlert('Error', 'Failed to delete thread');
                }
            }
        );
    };

    const toggleMenu = (threadId) => {
        setMenuVisible(prev => ({
            ...prev,
            [threadId]: !prev[threadId]
        }));
    };
    const renderThreadItem = ({ item }) => {
        const isMyThread = item.author?._id === user?._id;

        return (
            <TouchableOpacity onPress={() => handleThreadPress(item)} activeOpacity={0.7}>
                <Card style={styles.threadCard}>
                    <Card.Content>
                        <View style={styles.threadHeader}>
                            <View style={styles.threadInfo}>
                                <Text style={styles.threadTitle}>{item.title}</Text>
                                <View style={styles.threadMeta}>
                                    <View style={styles.metaItem}>
                                        <Icon name="account" size={14} color={theme.colors.textSecondary} />
                                        <Text style={styles.metaText}>
                                            {item.author?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />
                                        <Text style={styles.metaText}>
                                            {formatDate(item.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                        </View>
                        {isMyThread && (
                            <View style={styles.myThreadBadge}>
                                <Text style={styles.myThreadText}>Your thread</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading forum..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {forum && (
                    <View style={styles.forumHeader}>
                        <Text style={styles.forumTitle}>{forum.title}</Text>
                        <Text style={styles.forumDescription}>{forum.description}</Text>
                    </View>
                )}

                <FlatList
                    data={threads}
                    renderItem={renderThreadItem}
                    keyExtractor={(item) => item._id}
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
                        <EmptyState
                            icon="forum-outline"
                            title="No threads yet"
                            message="Be the first to start a discussion!"
                            action={
                                <Button
                                    mode="contained"
                                    onPress={() => setModalVisible(true)}
                                    icon="plus"
                                >
                                    Create Thread
                                </Button>
                            }
                        />
                    }
                />

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                    color={theme.colors.onPrimary}
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
                        <Text style={styles.modalTitle}>Create New Thread</Text>
                        
                        <TextInput
                            label="Thread Title"
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
                            label="First Post"
                            value={formData.content}
                            onChangeText={(text) => setFormData({ ...formData, content: text })}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                            error={!!formErrors.content}
                        />
                        {formErrors.content && (
                            <Text style={styles.errorText}>{formErrors.content}</Text>
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
                                onPress={handleCreateThread}
                                style={styles.modalButton}
                            >
                                Create Thread
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ForumDetailScreen);