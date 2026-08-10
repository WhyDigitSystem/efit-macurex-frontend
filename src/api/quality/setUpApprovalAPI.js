// setUpApprovalAPI.js
import apiClient from "../apiClient";

/* Set Up Approval API
   Mirrors the quality API convention used in this app.
   The backend persists the header, approval details, summary and
   parameters in a single transaction and keeps the complete approval
   history for audit and quality tracking (server-side validation). */
const setUpApprovalAPI = {
  // Get Set Up Approvals by Organization ID
  getSetUpApprovalByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getSetUpApprovalByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.setUpApprovalVO || [];
    } catch (error) {
      console.error("Error fetching set up approvals:", error);
      throw error;
    }
  },

  // Get Set Up Approval by ID
  getSetUpApprovalById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getSetUpApprovalById?id=${id}`,
      );
      return res?.paramObjectsMap?.setUpApprovalVO || null;
    } catch (error) {
      console.error("Error fetching set up approval by ID:", error);
      throw error;
    }
  },

  // Create / Update Set Up Approval
  createUpdateSetUpApproval: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreateSetUpApproval",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving set up approval:", error);
      throw error;
    }
  },
};

export default setUpApprovalAPI;
