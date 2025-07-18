// frontend/src/screens/forums/ModernForumScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Card, FAB, Portal, Modal, Button, Chip, Avatar, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import forumService from '../../services/forumService';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatting';
import { modernForumStyles } from '../../styles/screens/forums/ForumScreenStyles';

const FORUM_CATEGORIES = [
    { key: 'all', label: 'All Forums', icon: 'forum', color: '#6366F1' },
    { key: 'general', label: 'General', icon: 'chat', color: '#10B981' },
    { key: 'freelancer', label: 'Freelancer', icon: 'briefcase-account', color: '#F59E0B' },
    { key: 'entrepreneur', label: 'Entrepreneur', icon: 'rocket-launch', color: '#EF4444' },
    { key: 'social', label: 'Social', icon: 'account-group', color: '#8B5CF6' },
    { key: 'help', label: 'Help & Support', icon: 'help-circle', color: '#06B6D4' },
];

const ModernForumScreen = ({ navigation }) => {
    const theme = useTheme();
    const styles = modernForumStyles(theme);
    const { user } = useAuth();
    
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent'); // recent, popular, alphabetical
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
            await forumService.createForum(formData.title, formData.description, formData.category, formData.tags);
            showSuccessAlert('Success', 'Forum created successfully!');
            setModalVisible(false);
            resetForm();
            loadForums();
        } catch (error) {
            console.error('Failed to create forum:', error);
            showErrorAlert('Error', error.message || 'Failed to create forum');
        }
    };

    const handleDeleteForum = async (forumId, forumTitle) => {
        showConfirmAlert(
            'Delete Forum',
            `Are you sure you want to delete "${forumTitle}"? This action cannot be undone.`,
            async () => {
                try {
                    await forumService.deleteForum(forumId);
                    showSuccessAlert('Success', 'Forum deleted successfully');
                    loadForums();
                } catch (error) {
                    showErrorAlert('Error', 'Failed to delete forum');
                }
            }
        );
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', category: 'general', tags: [] });
        setFormErrors({});
        setTagInput('');
    };

    const handleForumPress = (forum) => {
        navigation.navigate('ForumDetail', { 
            forumId: forum._id, 
            forumTitle: forum.title 
        });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim().toLowerCase()],
            });
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag),
        });
    };

    const toggleMenu = (forumId) => {
        setMenuVisible(prev => ({
            ...prev,
            [forumId]: !prev[forumId]
        }));
    };

    // Filter and sort forums
    const filteredAndSortedForums = useMemo(() => {
        let filtered = forums;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(forum =>
                forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                forum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (forum.tags && forum.tags.some(tag => 
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                ))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(forum => 
                forum.category === selectedCategory ||
                forum.title.toLowerCase().includes(selectedCategory)
            );
        }

        // Sort forums
        switch (sortBy) {
            case 'popular':
                return filtered.sort((a, b) => (b.threads?.length || 0) - (a.threads?.length || 0));
            case 'alphabetical':
                return filtered.sort((a, b) => a.title.localeCompare(b.title));
            case 'recent':
            default:
                return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
    }, [forums, searchQuery, selectedCategory, sortBy]);

    const renderCategoryChip = (category) => (
        <TouchableOpacity
            key={category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive,
                { borderColor: category.color }
            ]}
        >
            <Icon name={category.icon} size={16} color={
                selectedCategory === category.key ? theme.colors.onPrimary : category.color
            } />
            <Text style={[
                styles.categoryChipText,
                selectedCategory === category.key && styles.categoryChipTextActive
            ]}>
                {category.label}
            </Text>
        </TouchableOpacity>
    );

    const renderForumItem = ({ item }) => {
        const threadCount = item.threads?.length || 0;
        const isMyForum = item.user?._id === user?._id;
        const category = FORUM_CATEGORIES.find(cat => 
            cat.key === item.category || 
            item.title.toLowerCase().includes(cat.key)
        ) || FORUM_CATEGORIES[1];

        return (
            <TouchableOpacity onPress={() => handleForumPress(item)} activeOpacity={0.7}>
                <Card style={styles.forumCard}>
                    <Card.Content>
                        <View style={styles.forumHeader}>
                            <View style={styles.forumInfo}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.forumTitle}>{item.title}</Text>
                                    {isMyForum && (
                                        <Menu
                                            visible={menuVisible[item._id]}
                                            onDismiss={() => toggleMenu(item._id)}
                                            anchor={
                                                <TouchableOpacity
                                                    onPress={() => toggleMenu(item._id)}
                                                    style={styles.menuButton}
                                                >
                                                    <Icon name="dots-vertical" size={20} color={theme.colors.textSecondary} />
                                                </TouchableOpacity>
                                            }
                                        >
                                            <Menu.Item 
                                                onPress={() => {
                                                    toggleMenu(item._id);
                                                    // Navigate to edit screen
                                                }} 
                                                title="Edit Forum" 
                                                icon="pencil"
                                            />
                                            <Divider />
                                            <Menu.Item 
                                                onPress={() => {
                                                    toggleMenu(item._id);
                                                    handleDeleteForum(item._id, item.title);
                                                }} 
                                                title="Delete Forum" 
                                                icon="delete"
                                                titleStyle={{ color: theme.colors.error }}
                                            />
                                        </Menu>
                                    )}
                                </View>
                                
                                <Text style={styles.forumDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                                
                                <View style={styles.forumMeta}>
                                    <View style={styles.metaLeft}>
                                        <Chip
                                            style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}
                                            textStyle={[styles.categoryBadgeText, { color: category.color }]}
                                            icon={category.icon}
                                            compact
                                        >
                                            {category.label}
                                        </Chip>
                                        
                                        <View style={styles.metaItem}>
                                            <Icon name="forum" size={14} color={theme.colors.textSecondary} />
                                            <Text style={styles.metaText}>
                                                {threadCount} {threadCount === 1 ? 'thread' : 'threads'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.metaRight}>
                                        <Avatar.Text 
                                            size={24} 
                                            label={item.user?.name?.charAt(0) || 'U'} 
                                            style={styles.authorAvatar}
                                        />
                                        <Text style={styles.metaText}>
                                            {formatDate(item.updatedAt)}
                                        </Text>
                                    </View>
                                </View>
                                
                                {item.tags && item.tags.length > 0 && (
                                    <View style={styles.tagsContainer}>
                                        {item.tags.slice(0, 3).map((tag, index) => (
                                            <Chip key={index} style={styles.tagChip} textStyle={styles.tagText} compact>
                                                #{tag}
                                            </Chip>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                        </View>
                        
                        {isMyForum && (
                            <View style={styles.myForumBadge}>
                                <Icon name="crown" size={12} color={theme.colors.warning} />
                                <Text style={styles.myForumText}>Your Forum</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading forums..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Community Forums</Text>
                    <Text style={styles.headerSubtitle}>
                        Connect, discuss, and share experiences
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search forums..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
                            <Icon name="close" size={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Filter */}
                <View style={styles.categoriesContainer}>
                    <FlatList
                        horizontal
                        data={FORUM_CATEGORIES}
                        renderItem={({ item }) => renderCategoryChip(item)}
                        keyExtractor={item => item.key}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                {/* Sort Options */}
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by:</Text>
                    {['recent', 'popular', 'alphabetical'].map(option => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => setSortBy(option)}
                            style={[
                                styles.sortOption,
                                sortBy === option && styles.sortOptionActive
                            ]}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                sortBy === option && styles.sortOptionTextActive
                            ]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Forums List */}
                <FlatList
                    data={filteredAndSortedForums}
                    renderItem={renderForumItem}
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
                            title={searchQuery ? "No forums found" : "No forums yet"}
                            message={searchQuery ? "Try adjusting your search terms" : "Be the first to create a forum!"}
                            action={
                                !searchQuery && (
                                    <Button
                                        mode="contained"
                                        onPress={() => setModalVisible(true)}
                                        icon="plus"
                                    >
                                        Create Forum
                                    </Button>
                                )
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

                {/* Create Forum Modal */}
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
                            style={styles.input}
                            placeholder="Forum Title"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                        {formErrors.title && (
                            <Text style={styles.errorText}>{formErrors.title}</Text>
                        )}
                        
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Description"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={3}
                        />
                        {formErrors.description && (
                            <Text style={styles.errorText}>{formErrors.description}</Text>
                        )}

                        {/* Tags Input */}
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                style={styles.tagInput}
                                placeholder="Add tags (press Enter to add)"
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={addTag}
                            />
                            <Button mode="outlined" onPress={addTag} compact>
                                Add
                            </Button>
                        </View>

                        {formData.tags.length > 0 && (
                            <View style={styles.selectedTags}>
                                {formData.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        style={styles.selectedTag}
                                        onClose={() => removeTag(tag)}
                                        closeIcon="close"
                                    >
                                        #{tag}
                                    </Chip>
                                ))}
                            </View>
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
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ModernForumScreen);