// frontend/src/screens/main/MessagesScreen.js
import React from 'react';
import { View } from 'react-native';
import PrivateChat from '../../components/ui/PrivateChat';

const MessagesScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <PrivateChat />
        </View>
    );
};

export default MessagesScreen;