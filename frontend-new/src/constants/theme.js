export const COLORS = {
    primary: '#4A90E2',
    secondary: '#50E3C2',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#9B9B9B',
    lightGray: '#F5F5F5',
    success: '#7ED321',
    error: '#D0021B',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    h1: 30,
    h2: 22,
    h3: 16,
};

export const FONTS = {
    h1: { fontFamily: 'Poppins-Bold', fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontFamily: 'Poppins-Bold', fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontFamily: 'Poppins-Bold', fontSize: SIZES.h3, lineHeight: 22 },
    body: { fontFamily: 'Poppins-Regular', fontSize: SIZES.font, lineHeight: 22 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;