// src/components/ui/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from '../common/Icon.js';
import { headerStyles as styles } from '../../styles/components/ui/HeaderStyles';

export const Header = React.memo(({
                                      title,
                                      subtitle,
                                      onBack,
                                      rightAction,
                                      variant = 'default',
                                      safe = true,
                                  }) => {
    const Container = safe ? SafeAreaView : View;

    return (
        <Container style={[styles.container, styles[variant]]}>
            <View style={styles.content}>
                {onBack && (
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, styles[`${variant}Title`]]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, styles[`${variant}Subtitle`]]}>{subtitle}</Text>
                    )}
                </View>

                {rightAction && (
                    <View style={styles.rightAction}>
                        {rightAction}
                    </View>
                )}
            </View>
        </Container>
    );
});
