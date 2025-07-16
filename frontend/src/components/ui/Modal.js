// src/components/ui/Modal.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../../styles/components/ui/ModalStyles';
import { colors } from '../../constants/theme';

export const CustomModal = ({
                                visible,
                                onClose,
                                title,
                                children,
                                showCloseButton = true,
                                closeOnBackdrop = true,
                                closeOnBackButton = true,
                                scrollable = true,
                                fullScreen = false,
                                position = 'center', // 'center', 'bottom', 'top'
                                showHandle = false, // for bottom sheet style
                                animationType = 'slide', // 'slide', 'fade'
                                style,
                                contentStyle,
                                headerStyle,
                                titleStyle,
                                bodyStyle,
                            }) => {
    const modalStyle = [
        styles.modal,
        position === 'bottom' && styles.bottomModal,
        position === 'top' && styles.topModal,
        fullScreen && styles.fullScreenModal,
        style,
    ];

    const containerStyle = [
        styles.container,
        position === 'bottom' && styles.bottomContainer,
        position === 'top' && styles.topContainer,
        fullScreen && styles.fullScreenContainer,
        contentStyle,
    ];

    const ContentWrapper = scrollable ? ScrollView : View;
    const contentProps = scrollable ? {
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled',
        contentContainerStyle: styles.scrollContent,
    } : {};

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={closeOnBackdrop ? onClose : undefined}
            onBackButtonPress={closeOnBackButton ? onClose : undefined}
            animationIn={animationType === 'fade' ? 'fadeIn' : 'slideInUp'}
            animationOut={animationType === 'fade' ? 'fadeOut' : 'slideOutDown'}
            style={modalStyle}
            backdropOpacity={0.5}
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <View style={containerStyle}>
                    {showHandle && position === 'bottom' && (
                        <View style={styles.handle} />
                    )}

                    {(title || showCloseButton) && (
                        <View style={[styles.header, headerStyle]}>
                            <Text style={[styles.title, titleStyle]}>{title}</Text>
                            {showCloseButton && (
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <ContentWrapper {...contentProps} style={[styles.body, bodyStyle]}>
                        {children}
                    </ContentWrapper>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Convenience components for common modal types
export const BottomSheet = (props) => (
    <CustomModal
        {...props}
        position="bottom"
        showHandle={true}
        closeOnBackdrop={true}
    />
);

export const AlertModal = ({
                               visible,
                               onClose,
                               title,
                               message,
                               actions = [],
                               ...props
                           }) => (
    <CustomModal
        visible={visible}
        onClose={onClose}
        title={title}
        scrollable={false}
        {...props}
    >
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertActions}>
            {actions.map((action, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.alertButton,
                        action.style === 'cancel' && styles.alertButtonCancel,
                        action.style === 'destructive' && styles.alertButtonDestructive,
                    ]}
                    onPress={action.onPress}
                >
                    <Text style={[
                        styles.alertButtonText,
                        action.style === 'cancel' && styles.alertButtonTextCancel,
                        action.style === 'destructive' && styles.alertButtonTextDestructive,
                    ]}>
                        {action.text}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </CustomModal>
);

export default CustomModal;