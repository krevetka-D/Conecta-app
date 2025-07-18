// src/components/ui/TabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '../common/Icon.js';
import { styles } from '../../styles/components/ui/TabBarStyles';
import { colors } from '../../constants/theme';

export const TabBar = ({
                           tabs,
                           activeTab,
                           onTabPress,
                           variant = 'default', // 'default', 'pills', 'underline'
                           scrollable = false,
                           showIcon = true,
                           showBadge = false,
                           style,
                           tabStyle,
                           activeTabStyle,
                           textStyle,
                           activeTextStyle,
                           indicatorStyle,
                       }) => {
    const Container = scrollable ? ScrollView : View;
    const containerProps = scrollable ? {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollContainer,
    } : {};

    return (
        <Container
            style={[
                styles.container,
                styles[`${variant}Container`],
                style
            ]}
            {...containerProps}
        >
            {tabs.map((tab, index) => {
                const isActive = activeTab === index || activeTab === tab.key;

                return (
                    <TouchableOpacity
                        key={tab.key || index}
                        style={[
                            styles.tab,
                            styles[`${variant}Tab`],
                            isActive && styles[`${variant}ActiveTab`],
                            tabStyle,
                            isActive && activeTabStyle,
                        ]}
                        onPress={() => onTabPress(tab.key || index)}
                        activeOpacity={0.7}
                    >
                        {showIcon && tab.icon && (
                            <Icon
                                name={tab.icon}
                                size={24}
                                color={isActive ? colors.primary : colors.textSecondary}
                                style={styles.icon}
                            />
                        )}

                        <Text
                            style={[
                                styles.text,
                                styles[`${variant}Text`],
                                isActive && styles[`${variant}ActiveText`],
                                textStyle,
                                isActive && activeTextStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {tab.label}
                        </Text>

                        {showBadge && tab.badge !== undefined && (
                            <View style={[
                                styles.badge,
                                tab.badge === 0 && styles.badgeHidden
                            ]}>
                                <Text style={styles.badgeText}>
                                    {tab.badge > 99 ? '99+' : tab.badge}
                                </Text>
                            </View>
                        )}

                        {variant === 'underline' && isActive && (
                            <View style={[styles.indicator, indicatorStyle]} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </Container>
    );
};

// Custom hook for managing tab state
export const useTabState = (initialTab = 0) => {
    const [activeTab, setActiveTab] = React.useState(initialTab);

    const handleTabPress = React.useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    return { activeTab, handleTabPress, setActiveTab };
};

// Example tab configuration
export const createTabs = (config) => {
    return config.map((item, index) => ({
        key: item.key || index,
        label: item.label,
        icon: item.icon,
        badge: item.badge,
        component: item.component,
    }));
};

export default TabBar;