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
                            theme={{ colors: { primary: colors.primary } }}
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



// Fixed styles component
const createStyles = (theme) => {
    // Ensure theme is defined with default values
    const safeTheme = {
        colors: {
            background: '#F3F4F6',
            surface: '#FFFFFF',
            text: '#111827',
            textSecondary: '#6B7280',
            textTertiary: '#9CA3AF',
            primary: '#1E3A8A',
            card: '#FFFFFF',
            backdrop: '#E5E7EB',
            error: '#EF4444',
            onPrimary: '#FFFFFF',
            ...theme?.colors
        },
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 20,
            xl: 30,
            ...theme?.spacing
        },
        roundness: theme?.roundness || 8,
        fonts: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
            ...theme?.fonts
        }
    };

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: safeTheme.colors.background,
        },
        container: {
            flex: 1,
            backgroundColor: safeTheme.colors.background,
        },
        listContent: {
            padding: safeTheme.spacing.m,
        },
        header: {
            marginBottom: safeTheme.spacing.l,
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
            marginBottom: safeTheme.spacing.xs,
        },
        headerSubtitle: {
            fontSize: 16,
            color: safeTheme.colors.textSecondary,
            textAlign: 'center',
        },
        categoryHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: safeTheme.spacing.m,
            marginTop: safeTheme.spacing.m,
        },
        categoryTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginLeft: safeTheme.spacing.s,
            color: safeTheme.colors.primary,
        },
        
        forumCard: {
            marginBottom: safeTheme.spacing.m,
            backgroundColor: safeTheme.colors.card,
            borderRadius: safeTheme.roundness,
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
            color: safeTheme.colors.text,
        },
        forumDescription: {
            fontSize: 14,
            color: safeTheme.colors.textSecondary,
            marginTop: safeTheme.spacing.xs,
        },
        forumMeta: {
            flexDirection: 'row',
            marginTop: safeTheme.spacing.m,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: safeTheme.spacing.l,
        },
        metaText: {
            marginLeft: safeTheme.spacing.xs,
            fontSize: 12,
            color: safeTheme.colors.textSecondary,
        },
        fab: {
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: safeTheme.colors.primary,
        },
        modal: {
            backgroundColor: safeTheme.colors.background,
            padding: safeTheme.spacing.l,
            margin: safeTheme.spacing.l,
            borderRadius: safeTheme.roundness,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: safeTheme.spacing.l,
            textAlign: 'center',
        },
        input: {
            marginBottom: safeTheme.spacing.m,
        },
        errorText: {
            color: safeTheme.colors.error,
            marginBottom: safeTheme.spacing.m,
            marginTop: -safeTheme.spacing.s,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: safeTheme.spacing.m,
        },
        modalButton: {
            marginLeft: safeTheme.spacing.m,
        },
    });
};