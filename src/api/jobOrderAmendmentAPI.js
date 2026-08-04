// jobOrderAmendmentAPI.js
import apiClient from "./apiClient";

const jobOrderAmendmentAPI = {
  // Get Job Order Amendments by Organization + Branch
  getJobOrderAmendmentByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getJobOrderAmendmentByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderAmendmentVO || [];
    } catch (error) {
      console.error("Error fetching job order amendments:", error);
      throw error;
    }
  },

  getJobOrderAmendmentById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getJobOrderAmendmentById", {
        params: { id },
      });
      return res?.paramObjectsMap?.jobOrderAmendmentVO || null;
    } catch (error) {
      console.error("Error fetching job order amendment by ID:", error);
      throw error;
    }
  },

  // Create / Update a Job Order Amendment. Linked to the original job order,
  // with header, detail and summary records saved in a single transaction.
  // The backend is expected to maintain complete amendment history with
  // revision tracking for audit.
  createUpdateJobOrderAmendment: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateJobOrderAmendment",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving job order amendment:", error);
      throw error;
    }
  },
};

export default jobOrderAmendmentAPI;
