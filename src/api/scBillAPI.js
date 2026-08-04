// scBillAPI.js
import apiClient from "./apiClient";

const scBillAPI = {
  // Get S.C. Bills by Organization + Branch
  getScBillByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getScBillByOrgId", {
        params: { branch, orgId },
      });
      return res?.paramObjectsMap?.scBillVO || [];
    } catch (error) {
      console.error("Error fetching S.C. bills:", error);
      throw error;
    }
  },

  getScBillById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getScBillById", {
        params: { id },
      });
      return res?.paramObjectsMap?.scBillVO || null;
    } catch (error) {
      console.error("Error fetching S.C. bill by ID:", error);
      throw error;
    }
  },

  // Create / Update a S.C. Bill linked to the vendor and contract. Header,
  // item details, tax grid and charges summary are saved in a single
  // transaction; the backend is expected to maintain complete billing history.
  createUpdateScBill: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateScBill",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving S.C. bill:", error);
      throw error;
    }
  },
};

export default scBillAPI;
