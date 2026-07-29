import apiClient from "./apiClient";

const bankAPI = {
  getAll: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getBankMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.bankList || [];
    } catch (error) {
      console.error("Error fetching banks:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getBankMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.tSBankVO || null;
    } catch (error) {
      console.error("Error fetching bank by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateBankMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving bank:", error);
      throw error;
    }
  },
};

export default bankAPI;
