
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from './Icon.js';
import { styles } from '../../styles/components/common/ErrorBoundaryStyles';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <Icon name="alert-circle-outline" size={80} color="#EF4444" />
                    <Text style={styles.title}>Oops! Something went wrong</Text>
                    <Text style={styles.message}>
                        We're sorry for the inconvenience. Please try restarting the app.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={this.resetError}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>

                    {__DEV__ && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                            <Text style={styles.errorText}>
                                {this.state.error && this.state.error.toString()}
                            </Text>
                            <Text style={styles.errorStack}>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;