import apiClient from "../apiClient";

const stockTransferAPI = {
  // Get Stock Transfer by ID
  getStockTransferById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getStockTransferById?id=${id}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching stock transfer by ID:", error);
      throw error;
    }
  },

  // Get Stock Transfer List by Organization ID and Branch
  getStockTransferByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getStockTransferByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching stock transfer list:", error);
      throw error;
    }
  },

  // Get Stock Transfer Document ID
  getStockTransferDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getStockTransferDocId?financialYear=${financialYear}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching stock transfer docId:", error);
      throw error;
    }
  },

  // Get Stock Transfer Item Details
  getStockTransferItemDetails: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getStockTransferItemDetails?branch=${branch}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching stock transfer item details:", error);
      throw error;
    }
  },

  // Item master lookup used to populate Item Code dropdown + fetch available qty
  getItemsByLocation: async (locationId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getItemsByLocation?locationId=${locationId}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching items by location:", error);
      throw error;
    }
  },

  // Create or Update Stock Transfer
  updateCreateStockTransfer: async (stockTransferDTO) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateStockTransfer",
        stockTransferDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating stock transfer:", error);
      throw error;
    }
  },
};

export default stockTransferAPI;