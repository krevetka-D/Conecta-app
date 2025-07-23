import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { Card, Chip, Searchbar } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ERROR_MESSAGES } from '../../constants/messages';
import { colors } from '../../constants/theme';
import contentService from '../../services/contentService';
import { useAuth } from '../../store/contexts/AuthContext';
import { resourcesStyles as styles } from '../../styles/screens/content/ResourcesScreenStyles';
import { showErrorAlert } from '../../utils/alerts';

const ResourcesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('myGuides');
    const [searchQuery, setSearchQuery] = useState('');
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Mock data for demonstration
    const mockMyGuides = [
        {
            _id: '1',
            title: 'Complete NIE Application Guide',
            description: 'Step-by-step process for obtaining your NIE',
            category: 'Legal',
            readTime: '10 min',
            icon: 'card-account-details',
            isNew: true,
        },
        {
            _id: '2',
            title: 'Understanding Spanish Tax System',
            description: 'Essential tax information for freelancers and entrepreneurs',
            category: 'Tax',
            readTime: '15 min',
            icon: 'calculator',
            isNew: false,
        },
    ];

    const mockAllGuides = [
        ...mockMyGuides,
        {
            _id: '3',
            title: 'Opening a Business Bank Account',
            description: 'Best banks and requirements for business accounts',
            category: 'Banking',
            readTime: '8 min',
            icon: 'bank',
            isNew: false,
        },
        {
            _id: '4',
            title: 'Networking in Alicante',
            description: 'Top events and communities for professionals',
            category: 'Networking',
            readTime: '12 min',
            icon: 'account-group',
            isNew: true,
        },
        {
            _id: '5',
            title: 'Finding Office Space',
            description: 'Coworking spaces and office rentals in Alicante',
            category: 'Workspace',
            readTime: '10 min',
            icon: 'office-building',
            isNew: false,
        },
    ];

    const loadGuides = useCallback(async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (activeTab === 'myGuides') {
                setGuides(mockMyGuides);
            } else {
                setGuides(mockAllGuides);
            }
        } catch (error) {
            console.error('Failed to load guides:', error);
            if (!refreshing) {
                showErrorAlert('Error', ERROR_MESSAGES.CONTENT_LOAD_FAILED);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, refreshing, user?.professionalPath]);

    useEffect(() => {
        setLoading(true);
        loadGuides();
    }, [activeTab, loadGuides]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadGuides();
    }, [loadGuides]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    }, []);

    const handleGuidePress = useCallback((guide) => {
        showErrorAlert(
            'Coming Soon',
            `The guide "${guide.title}" is being prepared and will be available soon!`,
        );
    }, []);

    const renderGuideItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleGuidePress(item)} activeOpacity={0.7}>
            <Card style={styles.guideCard}>
                <Card.Content>
                    <View style={styles.guideContent}>
                        <View
                            style={[
                                styles.guideIconContainer,
                                { backgroundColor: colors.primaryLight + '20' },
                            ]}
                        >
                            <Icon
                                name={item.icon || 'file-document-outline'}
                                size={24}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.guideTextContainer}>
                            <View style={styles.guideTitleRow}>
                                <Text style={styles.guideTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {item.isNew && (
                                    <Chip
                                        style={styles.newChip}
                                        textStyle={styles.newChipText}
                                        mode="flat"
                                    >
                                        NEW
                                    </Chip>
                                )}
                            </View>
                            <Text style={styles.guideDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                            <View style={styles.guideMetadata}>
                                <Chip
                                    style={styles.categoryChip}
                                    textStyle={styles.categoryChipText}
                                    mode="outlined"
                                >
                                    {item.category}
                                </Chip>
                                <Text style={styles.readTime}>
                                    <Icon
                                        name="clock-outline"
                                        size={14}
                                        color={colors.textSecondary}
                                    />{' '}
                                    {item.readTime}
                                </Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const getFilteredData = () => {
        if (!searchQuery) return guides;

        return guides.filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                item.title.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.category.toLowerCase().includes(searchLower)
            );
        });
    };

    const renderEmptyState = () => {
        if (searchQuery) {
            return (
                <EmptyState
                    icon="magnify"
                    title="No results found"
                    message={'Try adjusting your search terms'}
                    style={styles.emptyState}
                />
            );
        }

        if (activeTab === 'myGuides') {
            return (
                <EmptyState
                    icon="book-open-variant-outline"
                    title="No guides saved yet!"
                    message="Browse all guides and save the ones relevant to you."
                    style={styles.emptyState}
                />
            );
        } else {
            return (
                <EmptyState
                    icon="book-open-variant-outline"
                    title="Guides coming soon!"
                    message="We're working hard to create comprehensive guides to help you navigate life in Alicante. Check back soon!"
                    style={styles.emptyState}
                />
            );
        }
    };

    const filteredData = getFilteredData();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Searchbar
                    placeholder="Search guides..."
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    icon="magnify"
                    clearIcon="close"
                />

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'myGuides' && styles.activeTab]}
                        onPress={() => handleTabChange('myGuides')}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="bookmark"
                            size={20}
                            color={activeTab === 'myGuides' ? colors.primary : colors.textSecondary}
                            style={styles.tabIcon}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'myGuides' && styles.activeTabText,
                            ]}
                        >
                            My Guides
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'allGuides' && styles.activeTab]}
                        onPress={() => handleTabChange('allGuides')}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="book-open-variant"
                            size={20}
                            color={
                                activeTab === 'allGuides' ? colors.primary : colors.textSecondary
                            }
                            style={styles.tabIcon}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'allGuides' && styles.activeTabText,
                            ]}
                        >
                            All Guides
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <LoadingSpinner style={styles.loader} />
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderGuideItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[
                            styles.listContent,
                            filteredData.length === 0 && styles.emptyListContent,
                        ]}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colors.primary}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ResourcesScreen);
