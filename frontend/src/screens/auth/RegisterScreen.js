// frontend/src/screens/auth/RegisterScreen.js - Key changes only

// In the handleRegister function, store the selected items in AsyncStorage
const handleRegister = useCallback(async () => {
    if (selectedChecklistItems.length === 0) {
        showErrorAlert('Select Priorities', 'Please select at least one checklist item to get started.');
        return;
    }

    setLoading(true);
    try {
        // Create user object with professional path
        const userData = {
            name: values.name,
            email: values.email,
            password: values.password,
            professionalPath: selectedPath,
        };
        
        // Register the user
        await register(userData.name, userData.email, userData.password, userData.professionalPath);
        
        // Store selected checklist items in AsyncStorage for later use
        await AsyncStorage.setItem('pendingChecklistItems', JSON.stringify(selectedChecklistItems));
        
        // The auth context will handle navigation after successful registration
    } catch (error) {
        showErrorAlert('Registration Failed', error.message);
    } finally {
        setLoading(false);
    }
}, [values, register, selectedPath, selectedChecklistItems]);