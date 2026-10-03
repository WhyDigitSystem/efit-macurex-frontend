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

    getStockTransferChallanById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getStockTransferChallanById?id=${id}`,
            );
            return res?.paramObjectsMap?.stockTransferChallanResponseDTO || null;
        } catch (error) {
            console.error("Error fetching stock transfer challan by ID:", error);
            throw error;
        }
    },

    // 👇 NEW — Get Stock Transfer Challan DocId
    getStockTransferChallanDocId: async (financialYear, orgId) => {
        try {
            const res = await apiClient.get(
                `/api/dev/getStockTransferChallanDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return (
                res?.paramObjectsMap?.["StockTransferChallan DocId"] ||
                res?.paramObjectsMap?.stockTransferChallanDocId ||
                null
            );
        } catch (error) {
            console.error("Error fetching stock transfer challan docId:", error);
            throw error;
        }
    },

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