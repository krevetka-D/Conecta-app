// frontend/src/screens/personalChat/PersonalChatListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TextInput,
} from 'react-native';
import { Card, Avatar, Badge, FAB } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext.js';
import { colors, spacing, fonts } from '../../constants/theme.js';
import personalChatService from '../../services/personalChatService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';
import EmptyState from '../../components/common/EmptyState.js';
import { SCREEN_NAMES } from '../../constants/routes.js';

const PersonalChatListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = useCallback(async () => {
        try {
            const data = await personalChatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadConversations();
    }, [loadConversations]);

    const handleConversationPress = (conversation) => {
        navigation.navigate(SCREEN_NAMES.PERSONAL_CHAT_DETAIL, {
            userId: conversation.otherUser._id,
            userName: conversation.otherUser.name,
            conversationId: conversation.conversationId,
        });
    };

    const handleNewChat = () => {
        // Navigate to a user selection screen or show a modal
        // For now, we'll navigate to the groups screen where users can start chats
        navigation.navigate(SCREEN_NAMES.FORUMS);
    };

    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return format(date, 'HH:mm');
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) {
            return format(date, 'EEEE');
        } else {
            return format(date, 'dd/MM/yy');
        }
    };

    const renderConversation = ({ item }) => {
        const lastMessage = item.lastMessage;
        const otherUser = item.otherUser;
        const unreadCount = item.unreadCount || 0;
        
        return (
            <TouchableOpacity
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.7}
            >
                <Card style={styles.conversationCard}>
                    <View style={styles.conversationContent}>
                        <View style={styles.avatarContainer}>
                            <Avatar.Text 
                                size={50} 
                                label={otherUser.name.charAt(0).toUpperCase()} 
                                style={styles.avatar}
                            />
                            {otherUser.isOnline && (
                                <View style={styles.onlineIndicator} />
                            )}
                        </View>
                        
                        <View style={styles.messageContent}>
                            <View style={styles.messageHeader}>
                                <Text style={styles.userName} numberOfLines={1}>
                                    {otherUser.name}
                                </Text>
                                <Text style={styles.timestamp}>
                                    {formatLastMessageTime(lastMessage?.createdAt)}
                                </Text>
                            </View>
                            
                            <View style={styles.messagePreview}>
                                <Text 
                                    style={[
                                        styles.lastMessage,
                                        unreadCount > 0 && styles.unreadMessage
                                    ]} 
                                    numberOfLines={1}
                                >
                                    {lastMessage?.sender === user._id && 'You: '}
                                    {lastMessage?.content || 'No messages yet'}
                                </Text>
                                {unreadCount > 0 && (
                                    <Badge style={styles.unreadBadge}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Badge>
                                )}
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    const filteredConversations = conversations.filter(conv => 
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading conversations..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <View style={styles.searchContainer}>
                        <Icon name="magnify" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredConversations}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.conversationId}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="message-text-outline"
                            title="No conversations yet"
                            message="Start a conversation by tapping the + button"
                            action={
                                <TouchableOpacity style={styles.emptyStateButton} onPress={handleNewChat}>
                                    <Text style={styles.emptyStateButtonText}>Start New Chat</Text>
                                </TouchableOpacity>
                            }
                        />
                    }
                />

                <FAB
                    icon="message-plus"
                    style={styles.fab}
                    onPress={handleNewChat}
                    color={colors.textInverse}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 25,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fonts.sizes.md,
        color: colors.text,
    },
    listContent: {
        padding: spacing.md,
    },
    conversationCard: {
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 12,
        elevation: 1,
    },
    conversationContent: {
        flexDirection: 'row',
        padding: spacing.md,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: spacing.md,
    },
    avatar: {
        backgroundColor: colors.primary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        backgroundColor: colors.success,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    userName: {
        fontSize: fonts.sizes.md,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    timestamp: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
    },
    messagePreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    unreadMessage: {
        color: colors.text,
        fontWeight: '600',
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        marginLeft: spacing.sm,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
    emptyStateButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 25,
        marginTop: spacing.md,
    },
    emptyStateButtonText: {
        color: colors.textInverse,
        fontWeight: 'bold',
        fontSize: fonts.sizes.md,
    },
});

export default React.memo(PersonalChatListScreen);