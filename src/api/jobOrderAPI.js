// jobOrderAPI.js
import apiClient from "./apiClient";

const jobOrderAPI = {
  // Get Job Orders by Organization + Branch
  getJobOrderByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getJobOrderByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderVO || [];
    } catch (error) {
      console.error("Error fetching job orders:", error);
      throw error;
    }
  },

  getJobOrderById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getJobOrderById", {
        params: { id },
      });
      return res?.paramObjectsMap?.jobOrderVO || null;
    } catch (error) {
      console.error("Error fetching job order by ID:", error);
      throw error;
    }
  },

  // Create / Update a Job Order. Header, order detail, terms, tax and
  // attachment records are persisted in a single transaction; the backend
  // is expected to maintain the complete job order history for audit.
  createUpdateJobOrder: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateJobOrder",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving job order:", error);
      throw error;
    }
  },
};

export default jobOrderAPI;
