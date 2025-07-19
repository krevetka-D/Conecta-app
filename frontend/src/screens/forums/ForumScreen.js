
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { colors, fonts, spacing } from '../../constants/theme';
import { OptimizedInput } from '../../components/ui/OptimizedInput';

// Memoized Forum Item Component
const ForumItem = React.memo(({ item, onPress, styles }) => (
    <TouchableOpacity
        onPress={() => onPress(item)}
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

    // Optimize navigation handler
    const handleForumPress = useCallback((forum) => {
        navigation.navigate('ForumDetail', {
            forumId: forum._id,
            forumTitle: forum.title
        });
    }, [navigation]);

    // Fixed: Use setTimeout to avoid state update during render
    const handleTitleChange = useCallback((text) => {
        // Defer state update to next tick
        setTimeout(() => {
            setFormData(prev => ({ ...prev, title: text }));
            if (formErrors.title) {
                setFormErrors(prev => ({ ...prev, title: null }));
            }
        }, 0);
    }, [formErrors.title]);

    // Fixed: Use setTimeout to avoid state update during render
    const handleDescriptionChange = useCallback((text) => {
        // Defer state update to next tick
        setTimeout(() => {
            setFormData(prev => ({ ...prev, description: text }));
            if (formErrors.description) {
                setFormErrors(prev => ({ ...prev, description: null }));
            }
        }, 0);
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

    // Optimize list header
    const ListHeaderComponent = useMemo(() => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Community Forums</Text>
            <Text style={styles.headerSubtitle}>
                Connect, discuss, and share experiences
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
            // Reset form data after modal is closed
            setTimeout(() => {
                setFormData({ title: '', description: '', tags: [] });
                setFormErrors({});
            }, 100);
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
                            tintColor={colors.primary}
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
                            theme={{ colors: { primary: colors.primary } }}
                            maxLength={100}
                        />
                        {formErrors.title && (
                            <Text style={styles.errorText}>{formErrors.title}</Text>
                        )}
                        <OptimizedInput
    label="Description"
    value={formData.description}
    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
    multiline
    numberOfLines={4}
    maxLength={500}
    error={formErrors.description}
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

// styles component
const createStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    header: {
        marginBottom: theme.spacing.l,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: theme.spacing.s,
        color: theme.colors.primary,
    },
    
    forumCard: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.card,
        borderRadius: theme.roundness,
    },
    forumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forumInfo: {
        flex: 1,
    },
    forumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    forumDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    forumMeta: {
        flexDirection: 'row',
        marginTop: theme.spacing.m,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.l,
    },
    metaText: {
        marginLeft: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
    modal: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        borderRadius: theme.roundness,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    input: {
        marginBottom: theme.spacing.m,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.m,
        marginTop: -theme.spacing.s,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: theme.spacing.m,
    },
    modalButton: {
        marginLeft: theme.spacing.m,
    },
});

export default React.memo(ForumScreen);