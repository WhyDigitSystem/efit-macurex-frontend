import apiClient from "../apiClient";

const salesContractAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/salescontractamendment/getAll", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.amendmentList || [];
    } catch (error) {
      console.error("Error fetching SC amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/salescontractamendment/getById", {
        params: { id },
      });
      return res?.paramObjectsMap?.amendment || null;
    } catch (error) {
      console.error("Error fetching SC amendment by id:", error);
      throw error;
    }
  },

  getContractDetails: async (contractNo, orgId, branch) => {
    try {
      const res = await apiClient.get("/api/salescontractamendment/getContractDetails", {
        params: { contractNo, orgId, branch },
      });
      return res?.paramObjectsMap?.contractDetails || [];
    } catch (error) {
      console.error("Error fetching contract details:", error);
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
      const res = await apiClient.put("/api/salescontractamendment/createUpdate", data);
      return res;
    } catch (error) {
      console.error("Error saving SC amendment:", error);
      throw error;
    }
  },
};

export default salesContractAmendmentAPI;
