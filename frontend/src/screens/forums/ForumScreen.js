// frontend/src/screens/forums/ForumScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatting';
import { colors, fonts, spacing } from '../../constants/theme';

const ForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

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
            <Card style={styles.forumCard}>
                <Card.Content>
                    <Text style={styles.forumTitle}>{item.title}</Text>
                    <Text style={styles.forumDescription}>{item.description}</Text>
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
                            tintColor={colors.primary}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        marginBottom: spacing.lg,
        alignItems: 'center',
        padding: spacing.md,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
        fontFamily: fonts.families.bold,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        fontFamily: fonts.families.regular,
    },
    listContent: {
        padding: spacing.md,
    },
    forumCard: {
        marginBottom: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        elevation: 2,
    },
    forumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        fontFamily: fonts.families.semiBold,
    },
    forumDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        fontFamily: fonts.families.regular,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
});

export default React.memo(ForumScreen);