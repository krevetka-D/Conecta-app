import React from 'react';
import { Platform, Text, View } from 'react-native';

// Icon mapping for web
const WEB_ICON_MAP = {
    // Navigation & UI
    'home': '🏠',
    'home-outline': '🏠',
    'message': '💬',
    'message-outline': '💬',
    'view-dashboard': '📊',
    'view-dashboard-outline': '📊',
    'finance': '💰',
    'book-open-page-variant': '📚',
    'book-open-page-variant-outline': '📚',
    'forum': '👥',
    'forum-outline': '👥',
    'calendar-month': '📅',
    'calendar-month-outline': '📅',
    'account-circle': '👤',
    'account-circle-outline': '👤',
    
    // Common actions
    'chevron-right': '›',
    'chevron-left': '‹',
    'chevron-down': '⌄',
    'chevron-up': '⌃',
    'arrow-left': '←',
    'arrow-right': '→',
    'close': '✕',
    'plus': '+',
    'plus-circle': '⊕',
    'minus': '-',
    'check': '✓',
    'check-all': '✓✓',
    'dots-vertical': '⋮',
    'dots-horizontal': '⋯',
    'menu': '☰',
    'magnify': '🔍',
    'filter': '▽',
    'sort': '↕',
    
    // Status & Info
    'alert-circle-outline': '⚠',
    'information-outline': '📣',
    'help-circle-outline': '?',
    'bell-outline': '🔔',
    'bell': '🔔',
    'star': '★',
    'star-outline': '☆',
    'heart': '❤',
    'heart-outline': '♡',
    
    // Business & Professional
    'briefcase-account': '💼',
    'lightbulb-on': '💡',
    'lightbulb-outline': '💡',
    'rocket-launch': '🚀',
    'laptop': '💻',
    'calculator': '🧮',
    'bank': '🏦',
    'wallet': '💳',
    'cash-remove': '💸',
    'currency-eur': '€',
    
    // Social & Communication
    'account': '👤',
    'account-group': '👥',
    'account-group-outline': '👥',
    'account-plus': '👤+',
    'account-check': '👤✓',
    'account-cancel': '👤✕',
    'message-plus': '💬+',
    'message-text-outline': '💬',
    'send': '📤',
    'email': '✉',
    
    // Files & Documents
    'file-document-outline': '📄',
    'folder': '📁',
    'clipboard-check': '📋✓',
    'clipboard-check-outline': '📋',
    'clipboard-text': '📋',
    'card-account-details': '🆔',
    
    // Location & Time
    'map-marker': '📍',
    'map-marker-outline': '📍',
    'clock-outline': '🕐',
    'calendar': '📅',
    'calendar-blank-outline': '📅',
    'calendar-plus': '📅+',
    
    // Actions & Settings
    'settings': '⚙',
    'cog': '⚙',
    'account-cog': '👤⚙',
    'logout': '🚪',
    'login': '🔑',
    'pencil': '✏',
    'delete': '🗑',
    'trash-can-outline': '🗑',
    'refresh': '🔄',
    'download': '⬇',
    'upload': '⬆',
    'share': '🔗',
    
    // Forms & Input
    'eye': '👁',
    'eye-off': '👁‍🗨',
    'lock': '🔒',
    'lock-open': '🔓',
    'shield-check-outline': '🛡✓',
    
    // Business Specific
    'domain': '🏢',
    'identifier': '🆔',
    'cash-multiple': '💵',
    'finance': '📈',
    'briefcase': '💼',
    'school': '🎓',
    'party-popper': '🎉',
    'coffee': '☕',
    'presentation': '📊',
    
    // Default fallback
    'default': '•'
};

const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
    // For web, always use emoji/text icons
    if (Platform.OS === 'web') {
        const iconChar = WEB_ICON_MAP[name] || WEB_ICON_MAP.default;
        
        return (
            <View style={[{ 
                width: size, 
                height: size, 
                justifyContent: 'center', 
                alignItems: 'center' 
            }, style]}>
                <Text
                    style={{
                        fontSize: size * 0.8,
                        color: color,
                        textAlign: 'center',
                        lineHeight: size,
                    }}
                    allowFontScaling={false}
                    {...props}
                >
                    {iconChar}
                </Text>
            </View>
        );
    }

    // Native platform code
    try {
        const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
        return (
            <MaterialCommunityIcons
                name={name}
                size={size}
                color={color}
                style={style}
                {...props}
            />
        );
    } catch (error) {
        // Fallback for native if vector icons fail
        const iconChar = WEB_ICON_MAP[name] || WEB_ICON_MAP.default;
        return (
            <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
                <Text style={{ fontSize: size * 0.8, color, textAlign: 'center' }}>{iconChar}</Text>
            </View>
        );
    }
};

export default Icon;
