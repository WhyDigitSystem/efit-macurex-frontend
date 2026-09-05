import apiClient from '../apiClient';

const toolCategoryAPI = {
    // Create or update tool category
    createUpdateToolCategory: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/develop/createUpdateToolCategory`,
                payload
            );
            return response;
        } catch (error) {
            console.error('Error saving tool category:', error);
            throw error;
        }
    },

    getToolCategories: async (orgId) => {
        try {
            const response = await apiClient.get(
                `/api/develop/getToolCategoryByOrgId?orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching tool categories:', error);
            throw error;
        }
    },

    // Get tool category by ID
    getToolCategoryById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/develop/getToolCategoryById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching tool category:', error);
            throw error;
        }
    },
};

export default toolCategoryAPI;