// frontend/src/screens/forums/ForumScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, TextInput } from 'react-native-paper';
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
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        tags: [],
    });
    const [formErrors, setFormErrors] = useState({});
    const [tagInput, setTagInput] = useState('');

    // Memoize styles to prevent recreation on every render
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        loadForums();
    }, []);

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

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadForums();
    }, [loadForums]);

    const validateForm = useCallback(() => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Forum title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Forum description is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData.title, formData.description]);

    const handleCreateForum = useCallback(async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await forumService.createForum(formData.title, formData.description);
            showSuccessAlert('Success', 'Forum created successfully!');
            setModalVisible(false);
            resetForm();
            loadForums();
        } catch (error) {
            console.error('Failed to create forum:', error);
            showErrorAlert('Error', error.message || 'Failed to create forum');
        } finally {
            setSubmitting(false);
        }
    }, [formData.title, formData.description, validateForm, loadForums]);

    const resetForm = useCallback(() => {
        setFormData({
            title: '',
            description: '',
            category: 'general',
            tags: [],
        });
        setFormErrors({});
        setTagInput('');
    }, []);

    const handleAddTag = useCallback(() => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim().toLowerCase()],
            }));
            setTagInput('');
        }
    }, [tagInput, formData.tags]);

    const handleRemoveTag = useCallback((tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    }, []);

    // Optimize text input handlers
    const handleTitleChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, title: text }));
    }, []);

    const handleDescriptionChange = useCallback((text) => {
        setFormData(prev => ({ ...prev, description: text }));
    }, []);

    const handleModalDismiss = useCallback(() => {
        if (!submitting) {
            setModalVisible(false);
            resetForm();
        }
    }, [submitting, resetForm]);

    const renderForumItem = useCallback(({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ForumDetail', {
                forumId: item._id,
                forumTitle: item.title
            })}
            activeOpacity={0.7}
        >
            <Card style={styles.forumCard}>
                <Card.Content>
                    <View style={styles.forumHeader}>
                        <View style={styles.forumInfo}>
                            <Text style={styles.forumTitle}>{item.title}</Text>
                            <Text style={styles.forumDescription}>{item.description}</Text>
                            {item.user && (
                                <View style={styles.forumMeta}>
                                    <View style={styles.metaItem}>
                                        <Icon name="account" size={14} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>
                                            Created by {item.user.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    {item.threads && (
                                        <View style={styles.metaItem}>
                                            <Icon name="forum" size={14} color={colors.textSecondary} />
                                            <Text style={styles.metaText}>
                                                {item.threads.length} threads
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    ), [navigation, styles]);

    const keyExtractor = useCallback((item) => item._id, []);

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
                    keyExtractor={keyExtractor}
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

                {/* Create Forum Modal */}
                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={handleModalDismiss}
                        contentContainerStyle={styles.modal}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Create New Forum</Text>
                            
                            <TextInput
                                label="Forum Title"
                                value={formData.title}
                                onChangeText={handleTitleChange}
                                mode="outlined"
                                style={styles.input}
                                error={!!formErrors.title}
                                disabled={submitting}
                                theme={{ colors: { primary: colors.primary } }}
                            />
                            {formErrors.title && (
                                <Text style={styles.errorText}>{formErrors.title}</Text>
                            )}
                            
                            <TextInput
                                label="Description"
                                value={formData.description}
                                onChangeText={handleDescriptionChange}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                                error={!!formErrors.description}
                                disabled={submitting}
                                theme={{ colors: { primary: colors.primary } }}
                                maxLength={500}
                            />
                            {formErrors.description && (
                                <Text style={styles.errorText}>{formErrors.description}</Text>
                            )}

                            {/* Tags Section */}
                            <View style={styles.tagSection}>
                                <Text style={styles.tagLabel}>Tags (Optional)</Text>
                                <View style={styles.tagInputContainer}>
                                    <TextInput
                                        placeholder="Add tags..."
                                        value={tagInput}
                                        onChangeText={setTagInput}
                                        mode="outlined"
                                        style={styles.tagInput}
                                        disabled={submitting}
                                        theme={{ colors: { primary: colors.primary } }}
                                        onSubmitEditing={handleAddTag}
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={handleAddTag}
                                        style={styles.addTagButton}
                                        disabled={!tagInput.trim() || submitting}
                                    >
                                        Add
                                    </Button>
                                </View>
                                <View style={styles.tagsList}>
                                    {formData.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            style={styles.tag}
                                            onClose={() => handleRemoveTag(tag)}
                                            disabled={submitting}
                                        >
                                            {tag}
                                        </Chip>
                                    ))}
                                </View>
                            </View>
                            
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
                        </ScrollView>
                    </Modal>
                </Portal>
            </View>
        </SafeAreaView>
    );
};

// Move styles outside component and create them once
const createStyles = (theme) => StyleSheet.create({
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
    forumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forumInfo: {
        flex: 1,
        marginRight: spacing.sm,
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
        marginBottom: spacing.sm,
    },
    forumMeta: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: spacing.xs,
        fontSize: 12,
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
    modal: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: 16,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.lg,
        textAlign: 'center',
        color: colors.text,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    errorText: {
        color: colors.error,
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
        fontSize: 12,
        marginLeft: spacing.xs,
    },
    tagSection: {
        marginBottom: spacing.lg,
    },
    tagLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    tagInput: {
        flex: 1,
        marginRight: spacing.sm,
        backgroundColor: colors.surface,
    },
    addTagButton: {
        marginTop: 2,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        backgroundColor: colors.primary + '20',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
    },
});

export default React.memo(ForumScreen);