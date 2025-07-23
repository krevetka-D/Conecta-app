import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SCREEN_DIMENSIONS = {
    width: screenWidth,
    height: screenHeight,
};

export const DEVICE_SIZES = {
    isSmallDevice: screenWidth < 375,
    isMediumDevice: screenWidth >= 375 && screenWidth < 414,
    isLargeDevice: screenWidth >= 414,
    isTablet: screenWidth >= 768,
};

export const HEADER_DIMENSIONS = {
    height: Platform.OS === 'ios' ? 44 : 56,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    totalHeight: Platform.OS === 'ios' ? 64 : 56,
};

export const TAB_BAR_DIMENSIONS = {
    height: Platform.OS === 'ios' ? 49 : 60,
    iconSize: 24,
    labelFontSize: 12,
};

export const SAFE_AREA_PADDING = {
    top: Platform.OS === 'ios' ? 44 : 24,
    bottom: Platform.OS === 'ios' ? 34 : 0,
    left: 0,
    right: 0,
};

export const CONTENT_SPACING = {
    horizontal: 20,
    vertical: 16,
    section: 24,
};

export const CARD_DIMENSIONS = {
    minHeight: 80,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
};

export const BUTTON_DIMENSIONS = {
    small: {
        height: 32,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    medium: {
        height: 44,
        paddingHorizontal: 24,
        fontSize: 16,
    },
    large: {
        height: 56,
        paddingHorizontal: 32,
        fontSize: 18,
    },
};

export const INPUT_DIMENSIONS = {
    height: 56,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 16,
};

export const ICON_SIZES = {
    tiny: 16,
    small: 20,
    medium: 24,
    large: 32,
    huge: 48,
};

export const MODAL_DIMENSIONS = {
    maxWidth: Math.min(screenWidth * 0.9, 400),
    maxHeight: screenHeight * 0.8,
    padding: 20,
    borderRadius: 16,
};

export const LIST_DIMENSIONS = {
    itemHeight: 72,
    separatorHeight: 1,
    sectionHeaderHeight: 32,
};
