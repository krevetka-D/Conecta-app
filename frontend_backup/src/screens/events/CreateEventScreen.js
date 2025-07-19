
import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Platform,
    SafeAreaView,
} from 'react-native';
import { TextInput, Button, Chip, Portal, Modal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from '../../components/common/Icon.js';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import eventService from '../../services/eventService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { formatDate } from '../../utils/formatting';
import { createEventStyles } from '../../styles/screens/events/CreateEventScreenStyles';

const CreateEventScreen = ({ navigation }) => {
    const theme = useTheme();
    const styles = createEventStyles(theme);
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAudienceModal, setShowAudienceModal] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date(),
        time: '19:00',
        location: {
            name: '',
            address: '',
        },
        maxAttendees: '',
        category: 'meetup',
        targetAudience: 'all',
        tags: [],
        isPublic: true,
    });

    const [formErrors, setFormErrors] = useState({});
    const [tagInput, setTagInput] = useState('');

    const categories = [
        { value: 'networking', label: 'Networking', icon: 'account-group' },
        { value: 'workshop', label: 'Workshop', icon: 'school' },
        { value: 'social', label: 'Social', icon: 'party-popper' },
        { value: 'meetup', label: 'Meetup', icon: 'coffee' },
        { value: 'conference', label: 'Conference', icon: 'presentation' },
        { value: 'other', label: 'Other', icon: 'dots-horizontal' },
    ];

    const audiences = [
        { value: 'all', label: 'Everyone' },
        { value: 'freelancers', label: 'Freelancers' },
        { value: 'entrepreneurs', label: 'Entrepreneurs' },
        { value: 'both', label: 'Both' },
    ];

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (!formData.location.name.trim()) {
            errors.locationName = 'Location name is required';
        }
        if (!formData.time.trim()) {
            errors.time = 'Time is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const eventData = {
                ...formData,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
            };
            
            await eventService.createEvent(eventData);
            showSuccessAlert('Success', 'Event created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to create event:', error);
            showErrorAlert('Error', error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, date: selectedDate });
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim().toLowerCase()],
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag),
        });
    };

    const selectedCategory = categories.find(cat => cat.value === formData.category);
    const selectedAudience = audiences.find(aud => aud.value === formData.targetAudience);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Event Details</Text>
                
                <TextInput
                    label="Event Title"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    mode="outlined"
                    style={styles.input}
                    error={!!formErrors.title}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />
                {formErrors.title && (
                    <Text style={styles.errorText}>{formErrors.title}</Text>
                )}

                <TextInput
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    error={!!formErrors.description}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />
                {formErrors.description && (
                    <Text style={styles.errorText}>{formErrors.description}</Text>
                )}

                <Text style={styles.sectionTitle}>Date & Time</Text>

                <TouchableOpacity
                    style={styles.dateTimeSelector}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Icon name="calendar" size={24} color={theme.colors.primary} />
                    <Text style={styles.dateTimeText}>{formatDate(formData.date)}</Text>
                </TouchableOpacity>

                <TextInput
                    label="Time (e.g., 19:00)"
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                    mode="outlined"
                    style={styles.input}
                    error={!!formErrors.time}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />
                {formErrors.time && (
                    <Text style={styles.errorText}>{formErrors.time}</Text>
                )}

                <Text style={styles.sectionTitle}>Location</Text>

                <TextInput
                    label="Location Name"
                    value={formData.location.name}
                    onChangeText={(text) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, name: text }
                    })}
                    mode="outlined"
                    style={styles.input}
                    error={!!formErrors.locationName}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />
                {formErrors.locationName && (
                    <Text style={styles.errorText}>{formErrors.locationName}</Text>
                )}

                <TextInput
                    label="Address (Optional)"
                    value={formData.location.address}
                    onChangeText={(text) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, address: text }
                    })}
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />

                <Text style={styles.sectionTitle}>Event Settings</Text>

                <TextInput
                    label="Max Attendees (Optional)"
                    value={formData.maxAttendees}
                    onChangeText={(text) => setFormData({ ...formData, maxAttendees: text })}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />

                {/* Category Selection */}
                <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <View style={styles.selectorContent}>
                        <Icon name={selectedCategory.icon} size={24} color={theme.colors.primary} />
                        <View style={styles.selectorTextContainer}>
                            <Text style={styles.selectorLabel}>Category</Text>
                            <Text style={styles.selectorValue}>{selectedCategory.label}</Text>
                        </View>
                        <Icon name="chevron-down" size={24} color={theme.colors.textSecondary} />
                    </View>
                </TouchableOpacity>

                {/* Target Audience Selection */}
                <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setShowAudienceModal(true)}
                >
                    <View style={styles.selectorContent}>
                        <Icon name="account-group" size={24} color={theme.colors.primary} />
                        <View style={styles.selectorTextContainer}>
                            <Text style={styles.selectorLabel}>Target Audience</Text>
                            <Text style={styles.selectorValue}>{selectedAudience.label}</Text>
                        </View>
                        <Icon name="chevron-down" size={24} color={theme.colors.textSecondary} />
                    </View>
                </TouchableOpacity>

                <View style={styles.tagSection}>
                    <Text style={styles.radioLabel}>Tags</Text>
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            placeholder="Add tags..."
                            value={tagInput}
                            onChangeText={setTagInput}
                            mode="outlined"
                            style={styles.tagInput}
                            theme={{ colors: { primary: theme.colors.primary } }}
                            onSubmitEditing={handleAddTag}
                        />
                        <Button
                            mode="contained"
                            onPress={handleAddTag}
                            style={styles.addTagButton}
                            disabled={!tagInput.trim()}
                        >
                            Add
                        </Button>
                    </View>
                    <View style={styles.tagsList}>
                        {formData.tags.map((tag, index) => (
                            <Chip
                                key={index}
                                style={styles.tag}
                                onClose={() => handleRemoveTag(tag)}
                            >
                                {tag}
                            </Chip>
                        ))}
                    </View>
                </View>

                <View style={styles.submitContainer}>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        loading={loading}
                        disabled={loading}
                    >
                        Create Event
                    </Button>
                </View>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Category Selection Modal */}
            <Portal>
                <Modal
                    visible={showCategoryModal}
                    onDismiss={() => setShowCategoryModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Select Category</Text>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.value}
                            style={[
                                styles.modalOption,
                                formData.category === category.value && styles.modalOptionSelected
                            ]}
                            onPress={() => {
                                setFormData({ ...formData, category: category.value });
                                setShowCategoryModal(false);
                            }}
                        >
                            <Icon name={category.icon} size={24} color={
                                formData.category === category.value 
                                    ? theme.colors.primary 
                                    : theme.colors.textSecondary
                            } />
                            <Text style={[
                                styles.modalOptionText,
                                formData.category === category.value && styles.modalOptionTextSelected
                            ]}>
                                {category.label}
                            </Text>
                            {formData.category === category.value && (
                                <Icon name="check" size={24} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </Modal>
            </Portal>

            {/* Audience Selection Modal */}
            <Portal>
                <Modal
                    visible={showAudienceModal}
                    onDismiss={() => setShowAudienceModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Select Target Audience</Text>
                    {audiences.map((audience) => (
                        <TouchableOpacity
                            key={audience.value}
                            style={[
                                styles.modalOption,
                                formData.targetAudience === audience.value && styles.modalOptionSelected
                            ]}
                            onPress={() => {
                                setFormData({ ...formData, targetAudience: audience.value });
                                setShowAudienceModal(false);
                            }}
                        >
                            <Text style={[
                                styles.modalOptionText,
                                formData.targetAudience === audience.value && styles.modalOptionTextSelected
                            ]}>
                                {audience.label}
                            </Text>
                            {formData.targetAudience === audience.value && (
                                <Icon name="check" size={24} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

export default React.memo(CreateEventScreen);