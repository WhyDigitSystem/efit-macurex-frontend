import apiClient from "../apiClient";

const purchaseContractAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/purchasecontractamendment/getAll", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.amendmentList || [];
    } catch (error) {
      console.error("Error fetching PC amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/purchasecontractamendment/getById", {
        params: { id },
      });
      return res?.paramObjectsMap?.amendment || null;
    } catch (error) {
      console.error("Error fetching PC amendment by id:", error);
      throw error;
    }
  },

  getContractDetails: async (contractNo, orgId, branch) => {
    try {
      const res = await apiClient.get("/api/purchasecontractamendment/getContractDetails", {
        params: { contractNo, orgId, branch },
      });
      return res?.paramObjectsMap?.contractDetails || [];
    } catch (error) {
      console.error("Error fetching contract details:", error);
      throw error;
    }
  },

  getPartyById: async (partyId, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getPartyById", {
        params: { partyId, orgId },
      });
      return res?.paramObjectsMap?.party || null;
    } catch (error) {
      console.error("Error fetching party:", error);
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

  getUnits: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getUnits", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.unitList || [];
    } catch (error) {
      console.error("Error fetching units:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put("/api/purchasecontractamendment/createUpdate", data);
      return res;
    } catch (error) {
      console.error("Error saving PC amendment:", error);
      throw error;
    }
  },
};

export default purchaseContractAmendmentAPI;
