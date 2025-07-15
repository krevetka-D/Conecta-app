import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const HubScreen = () => {
    const { user } = useSelector((state) => state.auth);

    const welcomeMessage = `Welcome back, ${user?.name || 'User'}!`;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.welcome}>{welcomeMessage}</Text>
                    <Text style={styles.subtext}>Let's get you set up for success in Alicante.</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Dashboard</Text>
                    <Text>Your hub content will go here.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray },
    header: { padding: SIZES.large, backgroundColor: COLORS.primary },
    welcome: { ...FONTS.h2, color: COLORS.white },
    subtext: { ...FONTS.body, color: COLORS.white, opacity: 0.9 },
    content: { padding: SIZES.medium },
    sectionTitle: { ...FONTS.h3, marginBottom: SIZES.small },
});

export default HubScreen;