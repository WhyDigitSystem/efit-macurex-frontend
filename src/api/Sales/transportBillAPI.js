import apiClient from "../apiClient";

const transportBillAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getTransportBillByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.transportBillList || [];
    } catch (error) {
      console.error("Error fetching Transport Bill records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getTransportBillById", {
        params: { id },
      });
      return res?.paramObjectsMap?.transportBillVO || null;
    } catch (error) {
      console.error("Error fetching Transport Bill by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateTransportBill", payload);
      return res;
    } catch (error) {
      console.error("Error saving Transport Bill:", error);
      throw error;
    }
  },

  getPlants: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getPlantMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.plantList || [];
    } catch (error) {
      console.error("Error fetching plants:", error);
      throw error;
    }
  },

  getTransportNames: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getTransportMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching transport names:", error);
      throw error;
    }
  },
};

export default transportBillAPI;
