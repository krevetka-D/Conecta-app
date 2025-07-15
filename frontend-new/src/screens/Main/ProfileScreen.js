import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../app/slices/authSlice';
import AppButton from '../../components/common/AppButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.info}>{user?.name}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.info}>{user?.email}</Text>
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.info}>{user?.role}</Text>
            </View>
            <AppButton title="Logout" onPress={() => dispatch(logout())} />
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
    infoContainer: {
        flex: 1,
    },
    label: {
        ...FONTS.h3,
        color: COLORS.gray,
        marginTop: SIZES.medium
    },
    info: {
        ...FONTS.body,
        fontSize: SIZES.large
    }
});

export default ProfileScreen;