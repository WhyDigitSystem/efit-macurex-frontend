// rootCauseAnalysisAPI.js
import apiClient from "../apiClient";

/* Root Cause Analysis API
   Mirrors the quality API convention used in this app.
   The backend persists the header, root cause details and summary in a
   single transaction and keeps the complete RCA history with corrective
   and preventive actions (server-side validation). */
const rootCauseAnalysisAPI = {
  // Get Root Cause Analyses by Organization ID
  getRootCauseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getRootCauseAnalysisByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.rootCauseAnalysisVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching root cause analyses:", error);
      throw error;
    }
  },

  // Get Root Cause Analysis by ID
  getRootCauseById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getRootCauseAnalysisById?id=${id}`,
      );
      return res?.paramObjectsMap?.rootCauseAnalysisVO || null;
    } catch (error) {
      console.error("Error fetching root cause analysis by ID:", error);
      throw error;
    }
  },

  // Create / Update Root Cause Analysis
  // payload = header + rootCauseDetails + summary (single transaction)
  createUpdateRootCause: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreateRootCauseAnalysis",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving root cause analysis:", error);
      throw error;
    }
  },
};

export default rootCauseAnalysisAPI;
