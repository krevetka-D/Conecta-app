// src/utils/alerts.js
import { Alert } from 'react-native';

export const showErrorAlert = (title, message, onPress) => {
    Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
};

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
    Alert.alert(
        title,
        message,
        [
            { text: 'Cancel', onPress: onCancel, style: 'cancel' },
            { text: 'Confirm', onPress: onConfirm },
        ],
        { cancelable: false },
    );
};

export const showSuccessAlert = (title, message, onPress) => {
    Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
};

export const showAlert = (title, message, onPress) => {
    Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
};
