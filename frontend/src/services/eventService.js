// frontend/src/services/eventService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const eventService = {
    getEvents: async (params = {}) => {
        try {
            const response = await apiClient.get('/events', { params });
            return response;
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
            const response = await apiClient.post('/events', eventData);
            return response;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    updateEvent: async (id, eventData) => {
        try {
            const response = await apiClient.put(`/events/${id}`, eventData);
            return response;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/events/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    joinEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/join`);
            return response;
        } catch (error) {
            console.error('Error joining event:', error);
            throw error;
        }
    },

    leaveEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/leave`);
            return response;
        } catch (error) {
            console.error('Error leaving event:', error);
            throw error;
        }
    },
};

export default eventService;