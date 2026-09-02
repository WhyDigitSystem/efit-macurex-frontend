import apiClient from "../apiClient";

const machineMasterAPI = {

    // Get all Machine Setting Plans
    getMachineMaster: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/machineSettingPlan/getAll?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machine setting plans:", error);
            throw error;
        }
    },

    // Get Machine Setting Plan by ID
    getMachineMasterById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/machineSettingPlan/getById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machine setting plan:", error);
            throw error;
        }
    },

    // Create or Update Machine Setting Plan
    createUpdateMachineMaster: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/machineSettingPlan/createUpdate`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error saving machine setting plan:", error);
            throw error;
        }
    },
};

export default machineMasterAPI;