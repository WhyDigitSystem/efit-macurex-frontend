import apiClient from '../api/apiClient';

export const designationAPI = {
    // Get all designations
    getAllDesignations: async (orgId, branch) => {
        try {
            const response = await apiClient.get(`/api/efitmaster/getDesignationByOrgId?orgId=${orgId}&branch=${branch}`);
            return response;
        } catch (error) {
            console.error('Error fetching designations:', error);
            throw error;
        }
    },

    // Get designation by ID
    getDesignationById: async (id) => {
        try {
            const response = await apiClient.get(`/api/efitmaster/getDesignationById?id=${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching designation:', error);
            throw error;
        }
    },

    // Save/Update designation
    saveDesignation: async (payload) => {
        try {
            const response = await apiClient.put(`/api/efitmaster/updateCreateDesignation`, payload);
            return response;
        } catch (error) {
            console.error('Error saving designation:', error);
            throw error;
        }
    },
};