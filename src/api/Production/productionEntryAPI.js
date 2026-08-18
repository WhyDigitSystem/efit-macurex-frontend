import apiClient from "../apiClient";

const productionEntryAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionEntryByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.productionEntryList || [];
        } catch (error) {
            console.error("Error fetching production entries:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionEntryById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionEntryVO || null;
        } catch (error) {
            console.error("Error fetching production entry by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateProductionEntry",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving production entry:", error);
            throw error;
        }
    },
};

export default productionEntryAPI;