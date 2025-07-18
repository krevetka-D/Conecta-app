// frontend/src/services/eventService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const eventService = {
    getEvents: async (params = {}) => {
        try {
            // Convert the response to handle both array and object responses
            const response = await apiClient.get('/events', { params });
            
            // If response has events property, return that, otherwise assume it's an array
            if (response && response.events) {
                return response.events;
            } else if (Array.isArray(response)) {
                return response;
            } else {
                console.error('Unexpected response format:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    getEvent: async (id) => {
        try {
            const response = await apiClient.get(`/events/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    },

    createEvent: async (eventData) => {
        try {
            // Ensure required fields are properly formatted
            const formattedData = {
                ...eventData,
                date: new Date(eventData.date).toISOString(),
                location: {
                    name: eventData.location.name,
                    address: eventData.location.address || '',
                    city: eventData.location.city || 'Alicante'
                },
                tags: eventData.tags || [],
                maxAttendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : null
            };

            const response = await apiClient.post('/events', formattedData);
            return response;
        } catch (error) {
            console.error('Error creating event:', error);
            // Provide more specific error messages
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    updateEvent: async (id, eventData) => {
        try {
            const response = await apiClient.put(`/events/${id}`, eventData);
            return response;
        } catch (error) {
            console.error('Error updating event:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/events/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting event:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    joinEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/join`);
            return response;
        } catch (error) {
            console.error('Error joining event:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    leaveEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/leave`);
            return response;
        } catch (error) {
            console.error('Error leaving event:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    cancelEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/cancel`);
            return response;
        } catch (error) {
            console.error('Error cancelling event:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },
    
    getUpcomingEvents: async (limit = 5) => {
        try {
            const response = await apiClient.get('/events', {
                params: { 
                    upcoming: 'true',
                    limit 
                }
            });
            
            if (response && response.events) {
                return response.events;
            } else if (Array.isArray(response)) {
                return response;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            return [];
        }
    }
};

export default eventService;