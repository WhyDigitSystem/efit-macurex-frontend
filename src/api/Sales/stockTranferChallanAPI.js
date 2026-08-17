import apiClient from "../apiClient";

const stockTransferChallanAPI = {

    getCustomerByOrgId: async (orgId, branch) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getCustomerForStockTransferChallan?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.customerList || [];
        } catch (error) {
            console.error("Error fetching customer list:", error);
            throw error;
        }
    },

    getItemDetails: async (orgId, branch) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getItemsForStockTransferChallan?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.itemList || [];
        } catch (error) {
            console.error("Error fetching item list:", error);
            throw error;
        }
    },

    // Get Stock Transfer Challan by Organization ID and Branch
    getStockTransferChallanByOrgId: async (orgId, branch) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getStockTransferChallanByOrgId?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.stockTransferChallanResponseDTO || [];
        } catch (error) {
            console.error("Error fetching stock transfer challan list:", error);
            throw error;
        }
    },

    // Get Stock Transfer Challan by ID
    getStockTransferChallanById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getStockTransferChallanById?id=${id}`,
            );
            // When fetching by ID, it returns a single object (not an array)
            return res?.paramObjectsMap?.stockTransferChallanResponseDTO || null;
        } catch (error) {
            console.error("Error fetching stock transfer challan by ID:", error);
            throw error;
        }
    },

    // Create / Update Stock Transfer Challan
    createUpdate: async (payload) => {
        try {
            const res = await apiClient.post(
                "/api/dev/updateCreateStockTransferChallan",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving stock transfer challan:", error);
            throw error;
        }
    },
};

export default stockTransferChallanAPI;