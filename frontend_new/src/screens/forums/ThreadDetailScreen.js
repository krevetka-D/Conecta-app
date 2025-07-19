
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/contexts/ThemeContext';

const ThreadDetailScreen = ({ route }) => {
    const theme = useTheme();
    const { threadId, threadTitle } = route.params;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Thread: {threadTitle}
            </Text>
            <Text style={[styles.placeholder, { color: theme.colors.textSecondary }]}>
                Thread detail view coming soon...
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    placeholder: {
        fontSize: 16,
    },
});

export default ThreadDetailScreen;