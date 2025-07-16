import { DefaultTheme } from 'react-native-paper';

export const colors = {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    accent: '#10B981',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
};

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        ...colors,
    },
    fonts: {
        regular: {
            fontFamily: 'Poppins-Regular',
        },
        medium: {
            fontFamily: 'Poppins-SemiBold',
        },
        light: {
            fontFamily: 'Poppins-Regular',
        },
        thin: {
            fontFamily: 'Poppins-Regular',
        },
    },
};