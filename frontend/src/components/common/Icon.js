
import React from 'react';
import { Text } from 'react-native';

// Fallback icon component that uses emoji/text
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
    // Map common icon names to emojis as fallback
    const iconMap = {
        // Navigation
        'home': '🏠',
        'home-outline': '🏠',
        'arrow-left': '←',
        'arrow-right': '→',
        'chevron-left': '‹',
        'chevron-right': '›',
        'chevron-down': '⌄',
        'close': '✕',
        'menu': '☰',

        // Common UI
        'check': '✓',
        'check-circle': '✓',
        'checkbox-marked': '☑',
        'checkbox-marked-circle': '✓',
        'checkbox-marked-circle-outline': '✓',
        'plus': '+',
        'minus': '-',
        'delete': '🗑',
        'pencil': '✏️',
        'dots-vertical': '⋮',

        // Finance/Budget
        'wallet': '💳',
        'cash': '💵',
        'cash-remove': '💸',
        'finance': '💰',
        'calculator': '🧮',
        'calculator-variant': '🧮',
        'calculator-variant-outline': '🧮',

        // Calendar/Time
        'calendar': '📅',
        'calendar-blank': '📅',
        'calendar-blank-outline': '📅',
        'calendar-multiple': '📅',
        'calendar-multiple-outline': '📅',
        'clock': '🕐',
        'clock-outline': '🕐',

        // Account/User
        'account': '👤',
        'account-circle': '👤',
        'account-circle-outline': '👤',
        'account-group': '👥',
        'account-group-outline': '👥',
        'account-cog': '⚙️',

        // Documents/Files
        'file-document': '📄',
        'file-document-outline': '📄',
        'file-document-alert-outline': '⚠️',
        'book-open-variant': '📖',
        'book-open-page-variant': '📖',
        'book-open-page-variant-outline': '📖',

        // Business
        'briefcase': '💼',
        'briefcase-account': '💼',
        'domain': '🏢',
        'rocket-launch': '🚀',
        'lightbulb': '💡',
        'lightbulb-on': '💡',
        'lightbulb-outline': '💡',

        // Communication
        'forum': '💬',
        'forum-outline': '💬',
        'email': '✉️',
        'phone': '📞',
        'chat': '💬',
        'message': '💬',

        // Location
        'map-marker': '📍',
        'map-marker-outline': '📍',

        // Info/Help
        'information': 'ℹ️',
        'information-outline': 'ℹ️',
        'help-circle': '❓',
        'help-circle-outline': '❓',
        'alert-circle-outline': '⚠️',

        // Status
        'star': '⭐',
        'bell': '🔔',
        'bell-outline': '🔔',
        'shield-check-outline': '🛡️',

        // Actions
        'logout': '🚪',
        'magnify': '🔍',
        'filter': '▽',
        'sort': '↕️',
        'refresh': '↻',
        'eye': '👁',
        'eye-off': '👁',
        'web': '🌐',

        // Misc
        'laptop': '💻',
        'identifier': '🆔',
        'bank': '🏦',
        'scale-balance': '⚖️',
        'translate': '🌐',
        'view-dashboard': '📊',
        'view-dashboard-outline': '📊',
        'clipboard-check': '📋',
        'clipboard-check-outline': '📋',
    };

    const displayIcon = iconMap[name] || '•';

    return (
        <Text
            style={[
                {
                    fontSize: size,
                    color: color,
                    fontFamily: 'System',
                    lineHeight: size * 1.2,
                    textAlign: 'center',
                    width: size * 1.2,
                },
                style,
            ]}
            {...props}
        >
            {displayIcon}
        </Text>
    );
};

export default Icon;