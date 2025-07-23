import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    LANGUAGE: 'language',
    THEME: 'theme',
};

export const storage = {
    // Token management
    async getToken() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    async setToken(token) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },

    async removeToken() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    },

    // User data management
    async getUser() {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    async setUser(user) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
            console.error('Error setting user data:', error);
        }
    },

    async removeUser() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        } catch (error) {
            console.error('Error removing user data:', error);
        }
    },

    // Clear all data
    async clearAll() {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },
};
