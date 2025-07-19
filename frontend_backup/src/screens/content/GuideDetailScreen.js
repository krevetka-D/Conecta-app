
import { WebView } from 'react-native-webview';
import { styles } from '../../styles/screens/content/GuideDetailScreenStyles';
import { useApi } from '../../hooks/useApi';
import contentService from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { showErrorAlert } from '../../utils/alerts';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import Icon from '../../components/common/Icon.js'; // Add this
import { Button } from '../../components/ui/Button'; // Add this
import { colors } from '../../constants/theme'; // Add this
import { SCREEN_NAMES } from '../../constants/routes';
const GuideDetailScreen = ({ route, navigation }) => {
    const { slug, title } = route.params || {};
    const [guide, setGuide] = useState(null);

    const { execute: fetchGuide, loading, error } = useApi(
        () => contentService.getGuideBySlug(slug)
    );

    useEffect(() => {
        if (slug) {
            loadGuide();
        }
    }, [slug]);

    useEffect(() => {
        // Update header title if we have the guide title
        if (guide?.title && navigation.setOptions) {
            navigation.setOptions({
                title: guide.title,
            });
        }
    }, [guide?.title, navigation]);

    const loadGuide = async () => {
        try {
            const data = await fetchGuide();
            setGuide(data);
        } catch (err) {
            showErrorAlert('Error', 'Failed to load guide. Please try again.');
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading guide..." />;
    }

    if (error || !guide) {
        return (
            <EmptyState
                icon="file-document-alert-outline"
                title="Guide Not Found"
                message="The guide you're looking for could not be loaded."
                action={
                    <Button
                        title="Go Back"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                    />
                }
            />
        );
    }

    // If content is HTML, render in WebView
    if (guide.contentType === 'html') {
        return (
            <View style={styles.container}>
                <WebView
                    source={{ html: guide.content }}
                    style={styles.webView}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                />
            </View>
        );
    }

    // Otherwise render as markdown/text
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>{guide.title}</Text>

            {guide.metadata?.author && (
                <Text style={styles.metadata}>
                    By {guide.metadata.author} • {guide.metadata.readTime || '5 min read'}
                </Text>
            )}

            {guide.metadata?.tags && (
                <View style={styles.tags}>
                    {guide.metadata.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            <Text style={styles.body}>{guide.content}</Text>

            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
                <View style={styles.relatedSection}>
                    <Text style={styles.relatedTitle}>Related Guides</Text>
                    {guide.relatedGuides.map((related) => (
                        <TouchableOpacity
                            key={related._id}
                            style={styles.relatedCard}
                            onPress={() => navigation.push(SCREEN_NAMES.GUIDE_DETAIL, {
                                slug: related.slug,
                                title: related.title,
                            })}
                        >
                            <Text style={styles.relatedCardTitle}>{related.title}</Text>
                            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

export default React.memo(GuideDetailScreen);