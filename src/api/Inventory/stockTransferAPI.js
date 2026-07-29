import apiClient from "../apiClient";

export const stockTransferAPI = {
  getStockTransferById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getStockTransferById?id=${id}`,
      );
      return res?.paramObjectsMap?.stockTransferVO || null;
    } catch (error) {
      console.error("Error fetching stock transfer by ID:", error);
      throw error;
    }
  },

  getStockTransferByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getStockTransferByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.stockTransferList || [];
    } catch (error) {
      console.error("Error fetching stock transfer list:", error);
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

  updateCreateStockTransfer: async (stockTransferDTO) => {
    try {
      const res = await apiClient.put(
        "/api/inventorymaster/updateCreateStockTransfer",
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
