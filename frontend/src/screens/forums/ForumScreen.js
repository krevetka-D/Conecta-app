import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, TextInput, Badge } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { forumsStyles as createStyles } from '../../styles/screens/forums/ForumScreenStyles';
import { colors } from '../../constants/theme';

// Add formatRelativeTime helper function
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
};

// Updated the renderItem to show last message and unread count
const ForumItem = React.memo(({ item, onPress, styles }) => (
    <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
    >
        <Card style={styles.forumCard}>
            <Card.Content>
                <View style={styles.forumHeader}>
                    <View style={styles.forumInfo}>
                        <View style={styles.titleRow}>
                            <Text style={styles.forumTitle}>{item.title}</Text>
                            {item.unreadCount > 0 && (
                                <Badge style={styles.unreadBadge}>{item.unreadCount}</Badge>
                            )}
                        </View>
                        
                        {item.lastMessage ? (
                            <Text style={styles.lastMessage} numberOfLines={1}>
                                <Text style={styles.lastMessageSender}>
                                    {item.lastMessage.sender.name}:
                                </Text>
                                {' '}{item.lastMessage.content}
                            </Text>
                        ) : (
                            <Text style={styles.forumDescription}>{item.description}</Text>
                        )}
                        
                        <View style={styles.forumMeta}>
                            {item.lastMessage && (
                                <Text style={styles.lastMessageTime}>
                                    {formatRelativeTime(item.lastMessage.createdAt)}
                                </Text>
                            )}
                            <View style={styles.metaItem}>
                                <Icon name="account-group" size={14} color={colors.textSecondary} />
                                <Text style={styles.metaText}>
                                    {item.onlineCount || 0} online
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                </View>
            </Card.Content>
        </Card>
    </TouchableOpacity>
));


const ForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: [],
    });
    const [formErrors, setFormErrors] = useState({});

    // Memoize styles to prevent recreation
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Optimize data fetching with useCallback
    const loadForums = useCallback(async () => {
        try {
            const data = await forumService.getForums();
            setForums(data || []);
        } catch (error) {
            console.error('Failed to load forums:', error);
            setForums([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadForums();
    }, [loadForums]);

    // Optimize refresh handler
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForums();
    }, [loadForums]);

    // changed to Navigate to chat room instead of forum detail
    const handleForumPress = useCallback((forum) => {
    navigation.navigate('ChatRoom', {
        roomId: forum._id,
        roomTitle: forum.title
    });
}, [navigation]);

    // Fixed: Direct state updates without side effects
    const handleTitleChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, title: text }));
        if (formErrors.title) {
            setFormErrors(prev => ({ ...prev, title: null }));
        }
    }, [formErrors.title]);

    const handleDescriptionChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, description: text }));
        if (formErrors.description) {
            setFormErrors(prev => ({ ...prev, description: null }));
        }
    }, [formErrors.description]);

    // Optimize validation
    const validateForm = useCallback(() => {
        const errors = {};
        const trimmedTitle = formData.title.trim();
        const trimmedDescription = formData.description.trim();
        
        if (!trimmedTitle) {
            errors.title = 'Forum title is required';
        } else if (trimmedTitle.length < 3) {
            errors.title = 'Title must be at least 3 characters';
        }
        
        if (!trimmedDescription) {
            errors.description = 'Forum description is required';
        } else if (trimmedDescription.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData.title, formData.description]);

    // Optimize submit handler
    const handleCreateForum = useCallback(async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await forumService.createForum(formData.title.trim(), formData.description.trim());
            showSuccessAlert('Success', 'Forum created successfully!');
            setModalVisible(false);
            setFormData({ title: '', description: '', tags: [] });
            setFormErrors({});
            loadForums();
        } catch (error) {
            console.error('Failed to create forum:', error);
            showErrorAlert('Error', error.message || 'Failed to create forum');
        } finally {
            setSubmitting(false);
        }
    }, [formData.title, formData.description, validateForm, loadForums]);

    // Optimize keyExtractor
    const keyExtractor = useCallback((item) => item._id, []);

    // changed for transition from forums to real-time
    const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Rooms</Text>
        <Text style={styles.headerSubtitle}>
            Join conversations and connect in real-time
        </Text>
    </View>
), [styles]);

    // Optimize empty component
    const ListEmptyComponent = useMemo(() => (
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
    ), []);

    // Handle modal dismiss
    const handleModalDismiss = useCallback(() => {
        if (!submitting) {
            setModalVisible(false);
            setFormData({ title: '', description: '', tags: [] });
            setFormErrors({});
        }
    }, [submitting]);

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading forums..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={forums}
                    renderItem={({ item }) => (
                        <ForumItem 
                            item={item} 
                            onPress={handleForumPress}
                            styles={styles}
                        />
                    )}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={ListHeaderComponent}
                    ListEmptyComponent={ListEmptyComponent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    windowSize={10}
                    initialNumToRender={10}
                />

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                />

                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={handleModalDismiss}
                        contentContainerStyle={styles.modal}
                    >
                        <Text style={styles.modalTitle}>Create New Forum</Text>
                        
                        <TextInput
                            label="Forum Title"
                            value={formData.title}
                            onChangeText={handleTitleChange}
                            mode="outlined"
                            style={styles.input}
                            error={!!formErrors.title}
                            disabled={submitting}
                            theme={{ colors: { primary: theme.colors.primary } }}
                            maxLength={100}
                        />
                        {formErrors.title && (
                            <Text style={styles.errorText}>{formErrors.title}</Text>
                        )}
                        
                        <TextInput
                            label="Forum Description"
                            value={formData.description}
                            onChangeText={handleDescriptionChange}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                            error={!!formErrors.description}
                            disabled={submitting}
                            theme={{ colors: { primary: theme.colors.primary } }}
                            maxLength={500}
                        />
                        {formErrors.description && (
                            <Text style={styles.errorText}>{formErrors.description}</Text>
                        )}
                        
                        <View style={styles.modalButtons}>
                            <Button
                                mode="outlined"
                                onPress={handleModalDismiss}
                                style={styles.modalButton}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleCreateForum}
                                style={styles.modalButton}
                                loading={submitting}
                                disabled={submitting}
                            >
                                Create Forum
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ForumScreen);