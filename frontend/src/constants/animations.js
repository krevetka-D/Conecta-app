import { Easing } from 'react-native';

export const ANIMATION_DURATIONS = {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
};

export const ANIMATION_CONFIGS = {
    // Spring animations
    spring: {
        default: {
            tension: 40,
            friction: 7,
        },
        bouncy: {
            tension: 30,
            friction: 5,
        },
        stiff: {
            tension: 100,
            friction: 20,
        },
    },

    // Timing animations
    timing: {
        default: {
            duration: ANIMATION_DURATIONS.normal,
            easing: Easing.inOut(Easing.ease),
        },
        fast: {
            duration: ANIMATION_DURATIONS.fast,
            easing: Easing.out(Easing.ease),
        },
        slow: {
            duration: ANIMATION_DURATIONS.slow,
            easing: Easing.inOut(Easing.ease),
        },
        elastic: {
            duration: ANIMATION_DURATIONS.normal,
            easing: Easing.elastic(1),
        },
    },
};

export const SCREEN_TRANSITION_CONFIG = {
    animation: 'spring',
    config: ANIMATION_CONFIGS.spring.default,
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
            },
        };
    },
};

export const FADE_ANIMATION = {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: ANIMATION_CONFIGS.timing.default,
};

export const SLIDE_ANIMATION = {
    from: { translateY: 20, opacity: 0 },
    animate: { translateY: 0, opacity: 1 },
    exit: { translateY: -20, opacity: 0 },
    transition: ANIMATION_CONFIGS.timing.default,
};

export const SCALE_ANIMATION = {
    from: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: ANIMATION_CONFIGS.timing.fast,
};
