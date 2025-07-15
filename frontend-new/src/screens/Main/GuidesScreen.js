import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const GuidesScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Guides & Resources</Text>
            <View>
                <Text style={styles.body}>A curated list of helpful guides and articles for freelancers and entrepreneurs in Alicante will be shown here.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SIZES.large,
        backgroundColor: COLORS.white,
    },
    title: {
        ...FONTS.h1,
        marginBottom: SIZES.large
    },
    body: {
        ...FONTS.body,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: SIZES.xlarge,
    }
});

export default GuidesScreen;