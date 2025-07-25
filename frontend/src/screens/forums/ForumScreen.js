import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Animated,
    Platform,
} from 'react-native';
import {
    Card,
    FAB,
    Portal,
    Modal,
    Button,
    Chip,
    TextInput,
    Badge,
    Provider,
    Searchbar,
} from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../constants/theme';
import { useSocketEvents } from '../../hooks/useSocketEvents';
import apiClient from '../../services/api/client';
import forumService from '../../services/forumService';
import realtimeService from '../../services/realtimeService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { forumsStyles as createStyles } from '../../styles/screens/forums/ForumScreenStyles';
import { devError, devWarn } from '../../utils';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { debounce } from '../../utils/debounce';

import ConnectionDebugModal from './ConnectionDebugModal';

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
        devError('ForumScreen', 'Error formatting date', error);
        return '';
    }
};

// Group Item Component with animation
const GroupItem = React.memo(({ item, onPress, styles, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, index]);

    if (!item || !item._id || !item.title) {
        return null;
    }

    const unreadCount = item.unreadCount || 0;
    const onlineCount = item.onlineCount || 0;

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
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
                                        <Icon
                                            name="account-group"
                                            size={14}
                                            color={colors.textSecondary}
                                        />
                                        <Text style={styles.metaText}>{onlineCount} online</Text>
                                    </View>
                                    {item.messageCount > 0 && (
                                        <View style={styles.metaItem}>
                                            <Icon
                                                name="message-text"
                                                size={14}
                                                color={colors.textSecondary}
                                            />
                                            <Text style={styles.metaText}>
                                                {item.messageCount} messages
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );
});

GroupItem.displayName = 'GroupItem';

const ForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionMode, setConnectionMode] = useState('none');

    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displaySearchQuery, setDisplaySearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [debugModalVisible, setDebugModalVisible] = useState(false);

    // Form state - kept in parent to avoid losing data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: [],
    });
    const [formErrors, setFormErrors] = useState({});

    // Memoize styles to prevent recreation
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Filter forums based on search query
    const filteredForums = useMemo(() => {
        if (!searchQuery.trim()) return forums;

        const query = searchQuery.toLowerCase();
        return forums.filter(
            (forum) =>
                forum.title.toLowerCase().includes(query) ||
                forum.description.toLowerCase().includes(query) ||
                (forum.lastMessage?.content || '').toLowerCase().includes(query),
        );
    }, [forums, searchQuery]);

    // Optimize data fetching with useCallback
    const loadForums = useCallback(async () => {
        try {
            const data = await forumService.getForums();
            const safeData = Array.isArray(data) ? data : [];
            const validForums = safeData.filter(
                (forum) => forum && typeof forum === 'object' && forum._id && forum.title,
            );
            setForums(validForums);
        } catch (error) {
            devError('ForumScreen', 'Failed to load groups', error);
            setForums([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Socket event handlers
    const socketEventHandlers = {
        'new_message': useCallback((data) => {
            // Clear API cache for forums and messages
            apiClient.clearCache('/forums');
            apiClient.clearCache('/messages');
            apiClient.clearCache('/messages/conversations');
            if (data.roomId) {
                apiClient.clearCache(`/chat/rooms/${data.roomId}/messages`);
            }
            
            setForums((prevForums) =>
                prevForums
                    .map((forum) => {
                        if (forum._id === data.roomId) {
                            return {
                                ...forum,
                                lastMessage: {
                                    content: data.content,
                                    sender: data.sender,
                                    createdAt: data.createdAt,
                                },
                                unreadCount: forum.unreadCount + 1,
                                lastActivity: data.createdAt,
                            };
                        }
                        return forum;
                    })
                    .sort(
                        (a, b) =>
                            new Date(b.lastActivity || b.createdAt) -
                            new Date(a.lastActivity || a.createdAt),
                    ),
            );
        }, []),
        
        'room_update': useCallback((data) => {
            if (data.type === 'online_count') {
                setForums((prevForums) =>
                    prevForums.map((forum) =>
                        forum._id === data.roomId ? { ...forum, onlineCount: data.count } : forum,
                    ),
                );
            }
        }, []),
        
        'new_room': useCallback((room) => {
            setForums((prevForums) => [room, ...prevForums]);
        }, []),
        
        'forum_update': useCallback((data) => {
            // Clear API cache for forums
            apiClient.clearCache('/forums');
            if (data.forum?._id) {
                apiClient.clearCache(`/forums/${data.forum._id}`);
            }
            
            if (data.type === 'create') {
                // Reload to get fresh data
                loadForums();
            } else if (data.type === 'update') {
                // Update existing forum
                setForums((prevForums) => 
                    prevForums.map(forum => 
                        forum._id === data.forum._id ? data.forum : forum,
                    ),
                );
            }
        }, [loadForums]),
    };
    
    // Use socket events hook
    useSocketEvents(socketEventHandlers, [loadForums]);

    useEffect(() => {
        loadForums();
        
        // Setup connection state monitoring
        const checkConnectionStatus = () => {
            const status = realtimeService.getStatus();
            setIsConnected(status.connected);
            setConnectionMode(status.mode);
        };
        
        // Check initial status
        checkConnectionStatus();
        
        // Check periodically
        const interval = setInterval(checkConnectionStatus, 3000);
        
        return () => {
            clearInterval(interval);
        };
    }, [loadForums]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForums();
    }, [loadForums]);

    const handleForumPress = useCallback(
        (forum) => {
            if (!forum || !forum._id || !forum.title) {
                devError('ForumScreen', 'Invalid group data', forum);
                return;
            }

            // Mark messages as read
            setForums((prevForums) =>
                prevForums.map((f) => (f._id === forum._id ? { ...f, unreadCount: 0 } : f)),
            );

            navigation.navigate('ChatRoom', {
                roomId: forum._id,
                roomTitle: forum.title,
            });
        },
        [navigation],
    );

    // Debounced search handler - update both display and search query
    const debouncedSetSearchQuery = useMemo(
        () =>
            debounce((text) => {
                setSearchQuery(text);
            }, 300),
        [],
    );
    
    const handleSearch = useCallback((text) => {
        setDisplaySearchQuery(text); // Update display immediately
        debouncedSetSearchQuery(text); // Debounce actual search
    }, [debouncedSetSearchQuery]);

    // Fixed: Direct state updates without side effects
    const handleTitleChange = useCallback(
        (text) => {
            setFormData((prev) => ({ ...prev, title: text || '' }));
            if (formErrors.title) {
                setFormErrors((prev) => ({ ...prev, title: null }));
            }
        },
        [formErrors.title],
    );

    const handleDescriptionChange = useCallback(
        (text) => {
            setFormData((prev) => ({ ...prev, description: text || '' }));
            if (formErrors.description) {
                setFormErrors((prev) => ({ ...prev, description: null }));
            }
        },
        [formErrors.description],
    );

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
            devError('ForumScreen', 'Failed to create group', error);
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
            devWarn('ForumScreen', 'Invalid item in groups list', item);
            return String(Math.random());
        }
        return item._id;
    }, []);

    const renderItem = useCallback(
        ({ item, index }) => {
            if (!item) return null;

            return (
                <GroupItem item={item} onPress={handleForumPress} styles={styles} index={index} />
            );
        },
        [handleForumPress, styles],
    );

    const ListHeaderComponent = useMemo(
        () => (
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chat Groups</Text>
                <Text style={styles.headerSubtitle}>
                    Join conversations and connect in real-time
                </Text>

                {(!isConnected || connectionMode === 'polling') && (
                    <TouchableOpacity 
                        style={[styles.connectionWarning, connectionMode === 'polling' && { backgroundColor: colors.info + '20' }]}
                        onPress={() => setDebugModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Icon 
                            name={connectionMode === 'polling' ? 'refresh' : 'wifi-off'} 
                            size={16} 
                            color={connectionMode === 'polling' ? colors.info : colors.warning} 
                        />
                        <Text style={styles.connectionWarningText}>
                            {connectionMode === 'polling' 
                                ? 'Using polling mode (WebSocket unavailable)' 
                                : 'Connecting... Real-time updates may be delayed'
                            }
                        </Text>
                        <Text style={[styles.connectionWarningText, { textDecorationLine: 'underline', marginLeft: 5 }]}>
                            Details
                        </Text>
                    </TouchableOpacity>
                )}

                <Searchbar
                    placeholder="Search groups..."
                    onChangeText={handleSearch}
                    value={displaySearchQuery}
                    style={styles.searchBar}
                    iconColor={theme.colors.primary}
                    inputStyle={styles.searchInput}
                    elevation={1}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>
        ),
        [styles, displaySearchQuery, handleSearch, theme, isConnected],
    );

    const ListEmptyComponent = useMemo(
        () => (
            <EmptyState
                icon={searchQuery ? 'magnify' : 'forum-outline'}
                title={searchQuery ? 'No groups found' : 'No groups yet'}
                message={
                    searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Be the first to create a group!'
                }
                action={
                    !searchQuery && (
                        <Button mode="contained" onPress={() => setModalVisible(true)} icon="plus">
                            <Text>Create Group</Text>
                        </Button>
                    )
                }
            />
        ),
        [searchQuery],
    );

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading groups..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={filteredForums}
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
                        devError('ForumScreen', 'FlatList error', error);
                    }}
                />

                <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />

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
                    {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}

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

                <ConnectionDebugModal
                    visible={debugModalVisible}
                    onDismiss={() => setDebugModalVisible(false)}
                    userId={user?._id}
                />
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ForumScreen);
