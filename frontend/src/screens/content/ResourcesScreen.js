// frontend/src/screens/resources/ResourcesScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { Card, Chip, Searchbar } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import contentService from '../../services/contentService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showErrorAlert } from '../../utils/alerts';
import { ERROR_MESSAGES } from '../../constants/messages';
import { resourcesStyles as styles } from '../../styles/screens/content/ResourcesScreenStyles';

const ResourcesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('guides');
    const [searchQuery, setSearchQuery] = useState('');
    const [guides, setGuides] = useState([]);
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Mock data for demonstration
    const mockGuides = [
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
        {
            _id: '3',
            title: 'Opening a Business Bank Account',
            description: 'Best banks and requirements for business accounts',
            category: 'Banking',
            readTime: '8 min',
            icon: 'bank',
            isNew: false,
        },
    ];

    const mockDirectory = [
        {
            _id: '1',
            name: 'García & Associates',
            category: 'GESTOR',
            description: 'Specialized in helping expats with tax and legal matters',
            rating: 4.8,
            isRecommended: true,
            contactInfo: {
                phone: '+34 965 123 456',
                email: 'info@garciaassociates.es',
                website: 'www.garciaassociates.es',
            },
        },
        {
            _id: '2',
            name: 'Alicante Legal Solutions',
            category: 'LAWYER',
            description: 'Expert lawyers for company formation and contracts',
            rating: 4.6,
            isRecommended: true,
            contactInfo: {
                phone: '+34 965 234 567',
                email: 'contact@alicantelegal.es',
                website: 'www.alicantelegal.es',
            },
        },
    ];

    const loadGuides = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setGuides(mockGuides);
        } catch (error) {
            console.error('Failed to load guides:', error);
            if (!refreshing) {
                showErrorAlert('Error', ERROR_MESSAGES.CONTENT_LOAD_FAILED);
            }
        }
    }, [refreshing, user?.professionalPath]);

    const loadDirectory = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setDirectory(mockDirectory);
        } catch (error) {
            console.error('Failed to load directory:', error);
            if (!refreshing) {
                showErrorAlert('Error', ERROR_MESSAGES.CONTENT_LOAD_FAILED);
            }
        }
    }, [refreshing]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (activeTab === 'guides') {
                await loadGuides();
            } else {
                await loadDirectory();
            }
            setLoading(false);
        };

        loadData();
    }, [activeTab, loadGuides, loadDirectory]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        if (activeTab === 'guides') {
            await loadGuides();
        } else {
            await loadDirectory();
        }
        setRefreshing(false);
    }, [activeTab, loadGuides, loadDirectory]);

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
            `The guide "${guide.title}" is being prepared and will be available soon!`
        );
    }, []);

    const handleContactPress = useCallback((contact, type) => {
        let message = '';
        switch (type) {
            case 'phone':
                message = `Call ${contact.phone}?`;
                break;
            case 'email':
                message = `Email ${contact.email}?`;
                break;
            case 'website':
                message = `Visit ${contact.website}?`;
                break;
        }
        showErrorAlert('Contact', message);
    }, []);

    const renderGuideItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleGuidePress(item)}
            activeOpacity={0.7}
        >
            <Card style={styles.guideCard}>
                <Card.Content>
                    <View style={styles.guideContent}>
                        <View style={[styles.guideIconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                            <Icon name={item.icon || 'file-document-outline'} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.guideTextContainer}>
                            <View style={styles.guideTitleRow}>
                                <Text style={styles.guideTitle} numberOfLines={1}>{item.title}</Text>
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
                                    <Icon name="clock-outline" size={14} color={colors.textSecondary} />
                                    {' '}{item.readTime}
                                </Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const renderDirectoryItem = ({ item }) => {
        const categoryIcons = {
            GESTOR: 'calculator-variant',
            LAWYER: 'scale-balance',
            REAL_ESTATE: 'home-city',
            TRANSLATOR: 'translate',
        };

        const categoryColors = {
            GESTOR: '#10B981',
            LAWYER: '#3B82F6',
            REAL_ESTATE: '#F59E0B',
            TRANSLATOR: '#8B5CF6',
        };

        return (
            <Card style={styles.directoryCard}>
                <Card.Content>
                    <View style={styles.directoryHeader}>
                        <View style={[
                            styles.directoryIconContainer,
                            { backgroundColor: (categoryColors[item.category] || colors.primary) + '20' }
                        ]}>
                            <Icon
                                name={categoryIcons[item.category] || 'briefcase'}
                                size={24}
                                color={categoryColors[item.category] || colors.primary}
                            />
                        </View>
                        <View style={styles.directoryTitleContainer}>
                            <Text style={styles.directoryName}>{item.name}</Text>
                            <View style={styles.directoryBadges}>
                                <Text style={styles.directoryCategory}>
                                    {item.category.replace('_', ' ')}
                                </Text>
                                {item.isRecommended && (
                                    <Chip
                                        style={styles.recommendedChip}
                                        textStyle={styles.recommendedText}
                                        icon="star"
                                    >
                                        Recommended
                                    </Chip>
                                )}
                            </View>
                        </View>
                        {item.rating && (
                            <View style={styles.ratingContainer}>
                                <Icon name="star" size={16} color={colors.warning} />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.directoryDescription}>{item.description}</Text>

                    <View style={styles.contactInfo}>
                        {item.contactInfo.phone && (
                            <TouchableOpacity
                                style={styles.contactButton}
                                onPress={() => handleContactPress(item.contactInfo, 'phone')}
                            >
                                <Icon name="phone" size={18} color={colors.primary} />
                                <Text style={styles.contactText}>{item.contactInfo.phone}</Text>
                            </TouchableOpacity>
                        )}
                        {item.contactInfo.email && (
                            <TouchableOpacity
                                style={styles.contactButton}
                                onPress={() => handleContactPress(item.contactInfo, 'email')}
                            >
                                <Icon name="email" size={18} color={colors.primary} />
                                <Text style={styles.contactText} numberOfLines={1}>
                                    {item.contactInfo.email}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {item.contactInfo.website && (
                            <TouchableOpacity
                                style={styles.contactButton}
                                onPress={() => handleContactPress(item.contactInfo, 'website')}
                            >
                                <Icon name="web" size={18} color={colors.primary} />
                                <Text style={styles.contactText} numberOfLines={1}>
                                    {item.contactInfo.website}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    const getFilteredData = () => {
        const data = activeTab === 'guides' ? guides : directory;
        if (!searchQuery) return data;

        return data.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            if (activeTab === 'guides') {
                return item.title.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.category.toLowerCase().includes(searchLower);
            } else {
                return item.name.toLowerCase().includes(searchLower) ||
                    item.category.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower);
            }
        });
    };

    const renderEmptyState = () => {
        if (searchQuery) {
            return (
                <EmptyState
                    icon="magnify"
                    title="No results found"
                    message={`Try adjusting your search terms`}
                    style={styles.emptyState}
                />
            );
        }

        if (activeTab === 'guides') {
            return (
                <EmptyState
                    icon="book-open-variant-outline"
                    title="Guides coming soon!"
                    message="We're working hard to create comprehensive guides to help you navigate life in Alicante. Check back soon!"
                    style={styles.emptyState}
                />
            );
        } else {
            return (
                <EmptyState
                    icon="account-group-outline"
                    title="Service directory coming soon!"
                    message="We're building a curated list of trusted professionals to help with your business needs."
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
                    placeholder={`Search ${activeTab === 'guides' ? 'guides' : 'services'}...`}
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    icon="magnify"
                    clearIcon="close"
                />

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'guides' && styles.activeTab]}
                        onPress={() => handleTabChange('guides')}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="book-open-variant"
                            size={20}
                            color={activeTab === 'guides' ? colors.primary : colors.textSecondary}
                            style={styles.tabIcon}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'guides' && styles.activeTabText
                        ]}>
                            Guides
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'directory' && styles.activeTab]}
                        onPress={() => handleTabChange('directory')}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="account-group"
                            size={20}
                            color={activeTab === 'directory' ? colors.primary : colors.textSecondary}
                            style={styles.tabIcon}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'directory' && styles.activeTabText
                        ]}>
                            Service Directory
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <LoadingSpinner style={styles.loader} />
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={activeTab === 'guides' ? renderGuideItem : renderDirectoryItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[
                            styles.listContent,
                            filteredData.length === 0 && styles.emptyListContent
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