// Add to the component state
const [connectionStatus, setConnectionStatus] = useState('connecting');

// Add connection status listener
useEffect(() => {
    const handleConnectionChange = (status) => {
        setConnectionStatus(status);
    };

    socketService.on('connect', () => handleConnectionChange('connected'));
    socketService.on('disconnect', () => handleConnectionChange('disconnected'));
    socketService.on('reconnecting', () => handleConnectionChange('reconnecting'));

    return () => {
        socketService.off('connect', handleConnectionChange);
        socketService.off('disconnect', handleConnectionChange);
        socketService.off('reconnecting', handleConnectionChange);
    };
}, []);

// Add connection status indicator in render
{connectionStatus !== 'connected' && (
    <View style={styles.connectionStatus}>
        <Text style={styles.connectionStatusText}>
            {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline Mode'}
        </Text>
    </View>
)}