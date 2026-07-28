import apiClient from "./apiClient";

const purchaseOrderAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/purchaseorderamendment/getAll", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.amendmentList || [];
    } catch (error) {
      console.error("Error fetching PO amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/api/purchaseorderamendment/getById`, {
        params: { id },
      });
      return res?.paramObjectsMap?.amendment || null;
    } catch (error) {
      console.error("Error fetching PO amendment by id:", error);
      throw error;
    }
  },

  getPoDetails: async (poNo, orgId, branch) => {
    try {
      const res = await apiClient.get("/api/purchaseorderamendment/getPoDetails", {
        params: { poNo, orgId, branch },
      });
      return res?.paramObjectsMap?.poDetails || [];
    } catch (error) {
      console.error("Error fetching PO details:", error);
      throw error;
    }
  },

  getPartyByCode: async (partyCode, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getPartyByCode", {
        params: { partyCode, orgId },
      });
      return res?.paramObjectsMap?.party || null;
    } catch (error) {
      console.error("Error fetching party:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put("/api/purchaseorderamendment/createUpdate", data);
      return res;
    } catch (error) {
      console.error("Error saving PO amendment:", error);
      throw error;
    }
  },
};

export default purchaseOrderAmendmentAPI;
