import apiClient from "../apiClient";

const productionTransferSlipAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionTransferSlipByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.productionTransferSlipList || [];
        } catch (error) {
            console.error("Error fetching production transfer slips:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionTransferSlipById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionTransferSlipVO || null;
        } catch (error) {
            console.error("Error fetching production transfer slip by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateProductionTransferSlip",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving production transfer slip:", error);
            throw error;
        }
    },
};

export default productionTransferSlipAPI;