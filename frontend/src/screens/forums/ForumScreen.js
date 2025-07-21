import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, TextInput, Badge, Provider } from 'react-native-paper';
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
    if (!dateString) return '';
    
    try {
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
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Group Item Component
const GroupItem = React.memo(({ item, onPress, styles }) => {
    if (!item || !item._id || !item.title) {
        return null;
    }

    const unreadCount = item.unreadCount || 0;
    const onlineCount = item.onlineCount || 0;

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <Card style={styles.forumCard}>
                <Card.Content>
                    <View style={styles.forumHeader}>
                        <View style={styles.forumInfo}>
                            <View style={styles.titleRow}>
                                <Text style={styles.forumTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                {unreadCount > 0 && (
                                    <Badge style={styles.unreadBadge}>
                                        <Text style={styles.unreadBadgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount.toString()}
                                        </Text>
                                    </Badge>
                                )}
                            </View>
                            
                            {item.lastMessage ? (
                                <Text style={styles.lastMessage} numberOfLines={1}>
                                    <Text style={styles.lastMessageSender}>
                                        {item.lastMessage.sender?.name || 'Unknown'}:
                                    </Text>
                                    <Text> {item.lastMessage.content || ''}</Text>
                                </Text>
                            ) : (
                                <Text style={styles.forumDescription} numberOfLines={2}>
                                    {item.description || ''}
                                </Text>
                            )}
                            
                            <View style={styles.forumMeta}>
                                {item.lastMessage && item.lastMessage.createdAt && (
                                    <Text style={styles.lastMessageTime}>
                                        {formatRelativeTime(item.lastMessage.createdAt)}
                                    </Text>
                                )}
                                <View style={styles.metaItem}>
                                    <Icon name="account-group" size={14} color={colors.textSecondary} />
                                    <Text style={styles.metaText}>
                                        {onlineCount} online
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
});

const ForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state - kept in parent to avoid losing data
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
            const safeData = Array.isArray(data) ? data : [];
            const validForums = safeData.filter(forum => 
                forum && 
                typeof forum === 'object' && 
                forum._id && 
                forum.title
            );
            setForums(validForums);
        } catch (error) {
            console.error('Failed to load groups:', error);
            setForums([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadForums();
    }, [loadForums]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForums();
    }, [loadForums]);

    const handleForumPress = useCallback((forum) => {
        if (!forum || !forum._id || !forum.title) {
            console.error('Invalid group data:', forum);
            return;
        }

        navigation.navigate('ChatRoom', {
            roomId: forum._id,
            roomTitle: forum.title
        });
    }, [navigation]);

    // Fixed: Direct state updates without side effects
    const handleTitleChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, title: text || '' }));
        if (formErrors.title) {
            setFormErrors(prev => ({ ...prev, title: null }));
        }
    }, [formErrors.title]);

    const handleDescriptionChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, description: text || '' }));
        if (formErrors.description) {
            setFormErrors(prev => ({ ...prev, description: null }));
        }
    }, [formErrors.description]);

    // Optimize validation
    const validateForm = useCallback(() => {
        const errors = {};
        const trimmedTitle = (formData.title || '').trim();
        const trimmedDescription = (formData.description || '').trim();
        
        if (!trimmedTitle) {
            errors.title = 'Group name is required';
        } else if (trimmedTitle.length < 3) {
            errors.title = 'Name must be at least 3 characters';
        }
        
        if (!trimmedDescription) {
            errors.description = 'Group description is required';
        } else if (trimmedDescription.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData.title, formData.description]);

    const handleCreateGroup = useCallback(async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const title = (formData.title || '').trim();
            const description = (formData.description || '').trim();
            
            await forumService.createForum(title, description);
            showSuccessAlert('Success', 'Group created successfully!');
            setModalVisible(false);
            setFormData({ title: '', description: '', tags: [] });
            setFormErrors({});
            loadForums();
        } catch (error) {
            console.error('Failed to create group:', error);
            showErrorAlert('Error', error.message || 'Failed to create group');
        } finally {
            setSubmitting(false);
        }
    }, [formData.title, formData.description, validateForm, loadForums]);

    const handleModalDismiss = useCallback(() => {
        if (!submitting) {
            setModalVisible(false);
            setFormData({ title: '', description: '', tags: [] });
            setFormErrors({});
        }
    }, [submitting]);

    const keyExtractor = useCallback((item) => {
        if (!item || !item._id) {
            console.warn('Invalid item in groups list:', item);
            return String(Math.random());
        }
        return item._id;
    }, []);

    const renderItem = useCallback(({ item }) => {
        if (!item) return null;
        
        return (
            <GroupItem 
                item={item} 
                onPress={handleForumPress}
                styles={styles}
            />
        );
    }, [handleForumPress, styles]);

    const ListHeaderComponent = useMemo(() => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Chat Groups</Text>
            <Text style={styles.headerSubtitle}>
                Join conversations and connect in real-time
            </Text>
        </View>
    ), [styles]);

    const ListEmptyComponent = useMemo(() => (
        <EmptyState
            icon="forum-outline"
            title="No groups yet"
            message="Be the first to create a group!"
            action={
                <Button
                    mode="contained"
                    onPress={() => setModalVisible(true)}
                    icon="plus"
                >
                    <Text>Create Group</Text>
                </Button>
            }
        />
    ), []);

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading groups..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={forums}
                    renderItem={renderItem}
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
                    onError={(error) => {
                        console.error('FlatList error:', error);
                    }}
                />

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                />

                {/* Modal without Provider/Portal wrapper to fix rendering issue */}
                <Modal
                    visible={modalVisible}
                    onDismiss={handleModalDismiss}
                    contentContainerStyle={[styles.modal, { elevation: 5 }]}
                    dismissable={!submitting}
                    dismissableBackButton={!submitting}
                >
                    <Text style={styles.modalTitle}>Create New Group</Text>
                    
                    <TextInput
                        label="Group Name"
                        value={formData.title || ''}
                        onChangeText={handleTitleChange}
                        mode="outlined"
                        style={styles.input}
                        error={!!formErrors.title}
                        disabled={submitting}
                        theme={{ colors: { primary: theme.colors.primary } }}
                        maxLength={100}
                        autoCorrect={false}
                    />
                    {formErrors.title && (
                        <Text style={styles.errorText}>{formErrors.title}</Text>
                    )}
                    
                    <TextInput
                        label="Group Description"
                        value={formData.description || ''}
                        onChangeText={handleDescriptionChange}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                        error={!!formErrors.description}
                        disabled={submitting}
                        theme={{ colors: { primary: theme.colors.primary } }}
                        maxLength={500}
                        autoCorrect={false}
                        autoComplete="off"
                        blurOnSubmit={true}
                        textAlignVertical="top"
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
                            <Text>Cancel</Text>
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateGroup}
                            style={styles.modalButton}
                            loading={submitting}
                            disabled={submitting}
                        >
                            <Text>Create Group</Text>
                        </Button>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ForumScreen);