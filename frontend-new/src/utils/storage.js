import * as SecureStore from 'expo-secure-store';

export async function setItem(key, value) {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error('Error storing item securely:', error);
    }
}

export async function getItem(key) {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error('Error getting item securely:', error);
        return null;
    }
}

export async function removeItem(key) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error('Error removing item securely:', error);
    }
}