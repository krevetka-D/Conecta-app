// frontend/src/components/ui/ShadowCard.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';

import { colors, shadows, borderRadius } from '../../constants/theme';

const ShadowCard = React.memo(
    ({
        children,
        onPress,
        style,
        contentStyle,
        shadowLevel = 'md',
        borderRadiusSize = 'md',
        overflow = 'hidden',
        disabled = false,
        ...props
    }) => {
        const Component = onPress ? TouchableOpacity : View;

        const cardStyle = [
            {
                backgroundColor: colors.surface,
                borderRadius: borderRadius[borderRadiusSize],
                ...shadows[shadowLevel],
            },
            style,
        ];

        const innerContentStyle = [
            {
                borderRadius: borderRadius[borderRadiusSize],
                overflow: overflow,
            },
            contentStyle,
        ];

        const componentProps = onPress
            ? {
                onPress,
                disabled,
                activeOpacity: 0.8,
                ...props,
            }
            : props;

        return (
            <Component style={cardStyle} {...componentProps}>
                <View style={innerContentStyle}>{children}</View>
            </Component>
        );
    },
);

ShadowCard.displayName = 'ShadowCard';

// Alternative using Card component with proper overflow handling
const PaperShadowCard = React.memo(
    ({
        children,
        onPress,
        style,
        contentStyle,
        elevation = 2,
        borderRadiusSize = 'md',
        overflow = 'hidden',
        ...props
    }) => {
        const Component = onPress ? TouchableOpacity : Card;

        if (onPress) {
            return (
                <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
                    <Card
                        elevation={elevation}
                        style={{ borderRadius: borderRadius[borderRadiusSize] }}
                        {...props}
                    >
                        <Card.Content style={{ padding: 0 }}>
                            <View
                                style={[
                                    {
                                        borderRadius: borderRadius[borderRadiusSize],
                                        overflow: overflow,
                                    },
                                    contentStyle,
                                ]}
                            >
                                {children}
                            </View>
                        </Card.Content>
                    </Card>
                </TouchableOpacity>
            );
        }

        return (
            <Card
                elevation={elevation}
                style={[{ borderRadius: borderRadius[borderRadiusSize] }, style]}
                {...props}
            >
                <Card.Content style={{ padding: 0 }}>
                    <View
                        style={[
                            {
                                borderRadius: borderRadius[borderRadiusSize],
                                overflow: overflow,
                            },
                            contentStyle,
                        ]}
                    >
                        {children}
                    </View>
                </Card.Content>
            </Card>
        );
    },
);

PaperShadowCard.displayName = 'PaperShadowCard';

export { ShadowCard, PaperShadowCard };
export default ShadowCard;
