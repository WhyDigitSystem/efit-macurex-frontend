// subContractingDcAPI.js
import apiClient from "./apiClient";

const subContractingDcAPI = {
  // Get Sub Contracting DCs by Organization + Branch
  getSubContractingDcByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSubContractingDcByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.subContractingDcVO || [];
    } catch (error) {
      console.error("Error fetching sub contracting DCs:", error);
      throw error;
    }
  },

  getSubContractingDcById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getSubContractingDcById", {
        params: { id },
      });
      return res?.paramObjectsMap?.subContractingDcVO || null;
    } catch (error) {
      console.error("Error fetching sub contracting DC by ID:", error);
      throw error;
    }
  },

  // Create / Update a Sub Contracting DC linked to a job order. Header,
  // outgoing item and summary records are saved in a single transaction;
  // the backend is expected to maintain complete subcontracting history.
  createUpdateSubContractingDc: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSubContractingDc",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sub contracting DC:", error);
      throw error;
    }
  },
};

export default subContractingDcAPI;
