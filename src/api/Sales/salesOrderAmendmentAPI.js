import apiClient from "../apiClient";

const salesOrderAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/salesorderamendment/getAll", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.amendmentList || [];
    } catch (error) {
      console.error("Error fetching SO amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/salesorderamendment/getById", {
        params: { id },
      });
      return res?.paramObjectsMap?.amendment || null;
    } catch (error) {
      console.error("Error fetching SO amendment by id:", error);
      throw error;
    }
  },

  getOrderDetails: async (soNo, orgId, branch) => {
    try {
      const res = await apiClient.get("/api/salesorderamendment/getOrderDetails", {
        params: { soNo, orgId, branch },
      });
      return res?.paramObjectsMap?.orderDetails || [];
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  getItems: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getItems", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put("/api/salesorderamendment/createUpdate", data);
      return res;
    } catch (error) {
      console.error("Error saving SO amendment:", error);
      throw error;
    }
  },
};

export default salesOrderAmendmentAPI;
