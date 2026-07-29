import apiClient from "../apiClient";

export const receiptAPI = {
  getReceiptById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getReceiptById?id=${id}`,
      );
      return res?.paramObjectsMap?.receiptVO || null;
    } catch (error) {
      console.error("Error fetching receipt by ID:", error);
      throw error;
    }
  },

  getReceiptByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getReceiptByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.receiptList || [];
    } catch (error) {
      console.error("Error fetching receipt list:", error);
      throw error;
    }
  },

  updateCreateReceipt: async (receiptDTO) => {
    try {
      const res = await apiClient.put(
        "/api/inventorymaster/updateCreateReceipt",
        receiptDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating receipt:", error);
      throw error;
    }
  },
};

export default receiptAPI;
