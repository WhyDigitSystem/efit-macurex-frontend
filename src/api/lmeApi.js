import apiClient from '../api/apiClient';

export const lmeAPI = {
    // Get all LME by Org ID and Branch
    getAllLME: async (orgId, branch) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/getLMEByOrgId?orgId=${orgId}&branch=${branch}`);
            return response;
        } catch (error) {
            console.error('Error fetching LME data:', error);
            throw error;
        }
    },

    // Get LME by ID
    getLMEById: async (id) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/getLMEMasterById?id=${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching LME by ID:', error);
            throw error;
        }
    },

    // Save/Update LME
    saveLME: async (payload) => {
        try {
            const response = await apiClient.put(`/api/commonmaster/updateCreateLMEMaster`, payload);
            return response;
        } catch (error) {
            console.error('Error saving LME:', error);
            throw error;
        }
    },

    getCurrencies: async (orgId) => {
        const response = await apiClient.get(`/api/commonmaster/currency?orgid=${orgId}`);
        return response;
    }
};