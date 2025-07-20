// frontend/src/AppMinimal.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const AppMinimal = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Conecta Alicante</Text>
                <Text style={styles.subtitle}>App is running!</Text>
                <Text style={styles.info}>If you see this, the basic app works.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 20,
    },
    info: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export default AppMinimal;