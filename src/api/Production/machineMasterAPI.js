import apiClient from "../apiClient";

const machineMasterAPI = {

    // Get all Machine Masters
    getMachineMaster: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/develop/getMachineMasterByOrgId?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching machine master:', error);
            throw error;
        }
    },

    // Get Machine Master by ID
    getMachineMasterById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/develop/getMachineMasterById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machine master by ID:", error);
            throw error;
        }
    },

    // Get Tool Categories for Machine Master
    getToolCategoryforMachineMaster: async (applicableFor, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/develop/getToolCategoryforMachineMaster?applicableFor=${applicableFor}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching tool categories for machine master:", error);
            throw error;
        }
    },

    // Create or Update Machine Master with FormData
    createUpdateMachineMaster: async (formData) => {
        try {
            const response = await apiClient.post(
                `/api/develop/updateCreateMachineMaster`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response;
        } catch (error) {
            console.error("Error saving machine master:", error);
            throw error;
        }
    },
};

export default machineMasterAPI;