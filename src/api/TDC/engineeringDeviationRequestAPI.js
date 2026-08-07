// engineeringDeviationRequestAPI.js
import apiClient from "../apiClient";

/* Engineering Deviation Request/Note API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the header, request-of-deviation, review,
   approvals, customer intimation/feedback and PDF attachments in a
   single transaction and keeps the complete deviation history with
   approval tracking (server-side validation). */
const engineeringDeviationRequestAPI = {
  // Get Engineering Deviation Requests by Organization ID
  getEdrByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getEngineeringDeviationRequestByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.engineeringDeviationRequestEntryVO || [];
    } catch (error) {
      console.error("Error fetching engineering deviation requests:", error);
      throw error;
    }
  },

  // Create / Update Engineering Deviation Request
  createUpdateEdr: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateEngineeringDeviationRequest",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving engineering deviation request:", error);
      throw error;
    }
  },
};

export default engineeringDeviationRequestAPI;
