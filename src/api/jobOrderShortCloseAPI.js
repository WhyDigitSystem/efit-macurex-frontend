// jobOrderShortCloseAPI.js
import apiClient from "./apiClient";

const jobOrderShortCloseAPI = {
  // Get Job Order Short Closes by Organization + Branch
  getJobOrderShortCloseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getJobOrderShortCloseByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderShortCloseVO || [];
    } catch (error) {
      console.error("Error fetching job order short closes:", error);
      throw error;
    }
  },

  getJobOrderShortCloseById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getJobOrderShortCloseById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.jobOrderShortCloseVO || null;
    } catch (error) {
      console.error("Error fetching job order short close by ID:", error);
      throw error;
    }
  },

  // Create / Update a job order short close record linked to the job order and
  // GRN. Header, detail and summary records are saved in a single transaction;
  // the backend is expected to maintain complete short close history.
  createUpdateJobOrderShortClose: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateJobOrderShortClose",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving job order short close:", error);
      throw error;
    }
  },
};

export default jobOrderShortCloseAPI;