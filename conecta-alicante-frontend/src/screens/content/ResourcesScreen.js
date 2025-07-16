import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Card, Chip, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import contentService from '../../services/contentService';

const ResourcesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('guides');
    const [searchQuery, setSearchQuery] = useState('');
    const [guides, setGuides] = useState([]);
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'guides') {
            loadGuides();
        } else {
            loadDirectory();
        }
    }, [activeTab]);

    const loadGuides = async () => {
        setLoading(true);
        try {
            const data = await contentService.getGuides(user?.professionalPath);
            setGuides(data);
        } catch (error) {
            console.error('Failed to load guides:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDirectory = async () => {
        setLoading(true);
        try {
            const data = await contentService.getDirectory();
            setDirectory(data);
        } catch (error) {
            console.error('Failed to load directory:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderGuideItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('GuideDetail', { slug: item.slug })}
        >
            <Card style={styles.guideCard}>
                <Card.Content>
                    <View style={styles.guideContent}>
                        <Icon name="file-document-outline" size={24} color={colors.primary} />
                        <Text style={styles.guideTitle}>{item.title}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const renderDirectoryItem = ({ item }) => (
        <Card style={styles.directoryCard}>
            <Card.Content>
                <View style={styles.directoryHeader}>
                    <Text style={styles.directoryName}>{item.name}</Text>
                    {item.isRecommended && (
                        <Chip style={styles.recommendedChip} textStyle={styles.recommendedText}>
                            Recommended
                        </Chip>
                    )}
                </View>
                <Text style={styles.directoryCategory}>{item.category}</Text>
                <Text style={styles.directoryDescription}>{item.description}</Text>
                <View style={styles.contactInfo}>
                    {item.contactInfo.phone && (
                        <TouchableOpacity style={styles.contactButton}>
                            <Icon name="phone" size={20} color={colors.primary} />
                            <Text style={styles.contactText}>{item.contactInfo.phone}</Text>
                        </TouchableOpacity>
                    )}
                    {item.contactInfo.email && (
                        <TouchableOpacity style={styles.contactButton}>
                            <Icon name="email" size={20} color={colors.primary} />
                            <Text style={styles.contactText}>{item.contactInfo.email}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder={`Search ${activeTab}`}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'guides' && styles.activeTab]}
                    onPress={() => setActiveTab('guides')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'guides' && styles.activeTabText
                    ]}>
                        Guides
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'directory' && styles.activeTab]}
                    onPress={() => setActiveTab('directory')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'directory' && styles.activeTabText
                    ]}>
                        Service Directory
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'guides' ? (
                <FlatList
                    data={guides.filter(g =>
                        g.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    renderItem={renderGuideItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <FlatList
                    data={directory.filter(d =>
                        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        d.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    renderItem={renderDirectoryItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        margin: 16,
        elevation: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
    },
    activeTabText: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.primary,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    guideCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    guideContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    guideTitle: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        marginLeft: 12,
    },
    directoryCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    directoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    directoryName: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
    },
    recommendedChip: {
        backgroundColor: colors.accent,
    },
    recommendedText: {
        fontSize: 12,
        color: 'white',
    },
    directoryCategory: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.primary,
        marginBottom: 8,
    },
    directoryDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    contactInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.primary,
        marginLeft: 6,
    },
});

export default ResourcesScreen;