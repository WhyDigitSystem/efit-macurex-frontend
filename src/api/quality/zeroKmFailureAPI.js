// zeroKmFailureAPI.js
import apiClient from "../apiClient";

/* Zero Km Failure Entry API
   Mirrors the quality API convention used in this app.
   The backend persists the header, zero entry details and summary in a
   single transaction and keeps the complete failure record history for
   audit and quality tracking (server-side validation). */
const zeroKmFailureAPI = {
  // Get Zero Km Failures by Organization ID
  getZeroKmFailureByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getZeroKmFailureByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.zeroKmFailureVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching zero km failures:", error);
      throw error;
    }
  },

  // Get Zero Km Failure by ID
  getZeroKmFailureById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getZeroKmFailureById?id=${id}`,
      );
      return res?.paramObjectsMap?.zeroKmFailureVO || null;
    } catch (error) {
      console.error("Error fetching zero km failure by ID:", error);
      throw error;
    }
  },

  // Create / Update Zero Km Failure
  // payload = header + zeroEntryDetails + summary (single transaction)
  createUpdateZeroKmFailure: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreateZeroKmFailure",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving zero km failure:", error);
      throw error;
    }
  },
};

export default zeroKmFailureAPI;
