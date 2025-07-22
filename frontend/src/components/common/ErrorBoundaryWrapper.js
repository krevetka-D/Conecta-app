// frontend/src/components/common/ErrorBoundaryWrapper.js
import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from './Icon';
import { colors, fonts, spacing } from '../../constants/theme';

class ErrorBoundaryWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    async componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (__DEV__) {
            console.error('ErrorBoundary caught:', error);
            console.error('Error Info:', errorInfo);
        }

        // Track error count
        const errorCount = this.state.errorCount + 1;
        
        // Store error details
        this.setState({
            error,
            errorInfo,
            errorCount,
        });

        // Log to error tracking service (e.g., Sentry, Bugsnag)
        this.logErrorToService(error, errorInfo);

        // Store error in AsyncStorage for debugging
        try {
            const errorLog = {
                error: error.toString(),
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                platform: Platform.OS,
                version: Platform.Version,
            };
            
            await AsyncStorage.setItem(
                `error_log_${Date.now()}`,
                JSON.stringify(errorLog)
            );
        } catch (storageError) {
            console.error('Failed to store error log:', storageError);
        }
    }

    logErrorToService = (error, errorInfo) => {
        // TODO: Integrate with error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    };

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        // Call optional recovery callback
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    reloadApp = () => {
        // In production, you might want to reload the app
        if (!__DEV__) {
            // RNRestart.Restart(); // If using react-native-restart
        } else {
            this.resetError();
        }
    };

    render() {
        if (this.state.hasError) {
            const { fallback, showDetails = __DEV__ } = this.props;

            // Use custom fallback if provided
            if (fallback) {
                return fallback(this.state.error, this.resetError);
            }

            return (
                <View style={styles.container}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>
                            <Icon
                                name="alert-circle-outline"
                                size={80}
                                color={colors.error}
                                style={styles.icon}
                            />
                            
                            <Text style={styles.title}>Oops! Something went wrong</Text>
                            
                            <Text style={styles.message}>
                                {this.state.errorCount > 2
                                    ? "The app is experiencing repeated errors. Please restart the app."
                                    : "We're sorry for the inconvenience. The error has been logged and we'll fix it soon."}
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={this.resetError}
                                >
                                    <Text style={styles.primaryButtonText}>Try Again</Text>
                                </TouchableOpacity>

                                {this.state.errorCount > 2 && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.secondaryButton]}
                                        onPress={this.reloadApp}
                                    >
                                        <Text style={styles.secondaryButtonText}>Restart App</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {showDetails && this.state.error && (
                                <View style={styles.errorDetails}>
                                    <Text style={styles.errorTitle}>Error Details (Dev Only)</Text>
                                    
                                    <View style={styles.errorBox}>
                                        <Text style={styles.errorLabel}>Error:</Text>
                                        <Text style={styles.errorText}>
                                            {this.state.error.toString()}
                                        </Text>
                                    </View>

                                    {this.state.error.stack && (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorLabel}>Stack Trace:</Text>
                                            <ScrollView
                                                style={styles.stackTrace}
                                                horizontal
                                                showsHorizontalScrollIndicator
                                            >
                                                <Text style={styles.errorStack}>
                                                    {this.state.error.stack}
                                                </Text>
                                            </ScrollView>
                                        </View>
                                    )}

                                    {this.state.errorInfo && (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorLabel}>Component Stack:</Text>
                                            <ScrollView
                                                style={styles.stackTrace}
                                                horizontal
                                                showsHorizontalScrollIndicator
                                            >
                                                <Text style={styles.errorStack}>
                                                    {this.state.errorInfo.componentStack}
                                                </Text>
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    icon: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fonts.sizes.xxl,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    message: {
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: fonts.sizes.md * 1.5,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 8,
        marginBottom: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    primaryButtonText: {
        color: colors.textInverse,
        fontSize: fonts.sizes.md,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.text,
        fontSize: fonts.sizes.md,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorDetails: {
        width: '100%',
        marginTop: spacing.xl,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    errorTitle: {
        fontSize: fonts.sizes.lg,
        fontWeight: 'bold',
        color: colors.error,
        marginBottom: spacing.md,
    },
    errorBox: {
        marginBottom: spacing.md,
    },
    errorLabel: {
        fontSize: fonts.sizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    errorText: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    stackTrace: {
        maxHeight: 100,
    },
    errorStack: {
        fontSize: fonts.sizes.xs,
        color: colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: fonts.sizes.xs * 1.5,
    },
});

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
    const WrappedComponent = (props) => (
        <ErrorBoundaryWrapper {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundaryWrapper>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
    
    return WrappedComponent;
};

export default ErrorBoundaryWrapper;