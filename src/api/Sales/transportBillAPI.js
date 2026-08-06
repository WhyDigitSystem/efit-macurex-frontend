import apiClient from "../apiClient";

const transportBillAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/transportbill/getTransportBillByOrgId", {
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
      const res = await apiClient.get("/api/transportbill/getTransportBillById", {
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
      const res = await apiClient.put("/api/transportbill/createUpdateTransportBill", payload);
      return res;
    } catch (error) {
      console.error("Error saving Transport Bill:", error);
      throw error;
    }
  },

};

export default transportBillAPI;
