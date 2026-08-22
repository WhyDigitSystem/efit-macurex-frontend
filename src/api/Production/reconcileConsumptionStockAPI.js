import apiClient from "../apiClient";

const reconcileConsumptionStockAPI = {

    getReconcileConsumptionByOrgId: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/reconcile/getReconcileConsumptionByOrgId?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching reconcile records:", error);
            throw error;
        }
    },

    getReconcileConsumptionById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/reconcile/getReconcileConsumptionById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching reconcile record:", error);
            throw error;
        }
    },

    // Create or Update Reconcile Consumption Stock
    createUpdateReconcileConsumption: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/reconcile/createUpdateReconcileConsumption`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error saving reconcile record:", error);
            throw error;
        }
    },

    // Get Shop Floors
    getShopFloors: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/shopFloor/getShopFloors?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching shop floors:", error);
            throw error;
        }
    },

    // Get FG Items
    getFGItems: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/fgItem/getFGItems?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching FG items:", error);
            throw error;
        }
    },
};

export default reconcileConsumptionStockAPI;