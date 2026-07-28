// purchaseContractAPI.js
import apiClient from "../apiClient";

export const purchaseContractAPI = {
  // Get Purchase Contracts (Open) by Organization ID
  getContractByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPurchaseContractByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.contractList || [];
    } catch (error) {
      console.error("Error fetching purchase contracts:", error);
      throw error;
    }
  },

  // Create / Update Purchase Contract (Open)
  createUpdateContract: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdatePurchaseContract`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving purchase contract:", error);
      throw error;
    }
  },
};

export default purchaseContractAPI;
