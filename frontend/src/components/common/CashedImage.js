// frontend/src/components/common/CachedImage.js
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';

const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}images/`;

export const CachedImage = ({ source, style, ...props }) => {
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadImage();
    }, [source.uri]);

    const loadImage = async () => {
        if (!source.uri) {
            setLoading(false);
            return;
        }

        try {
            // Create cache directory if it doesn't exist
            await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, {
                intermediates: true,
            });

            // Generate cache key
            const hash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.MD5,
                source.uri,
            );
            const cachedPath = `${IMAGE_CACHE_DIR}${hash}.jpg`;

            // Check if cached
            const info = await FileSystem.getInfoAsync(cachedPath);

            if (info.exists) {
                setImageUri(cachedPath);
            } else {
                // Download and cache
                await FileSystem.downloadAsync(source.uri, cachedPath);
                setImageUri(cachedPath);
            }
        } catch (error) {
            console.error('Image cache error:', error);
            setImageUri(source.uri); // Fallback to network image
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator />
            </View>
        );
    }

    return <Image {...props} source={{ uri: imageUri }} style={style} />;
};
