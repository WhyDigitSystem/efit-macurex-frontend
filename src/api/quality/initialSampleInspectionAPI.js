// initialSampleInspectionAPI.js
import apiClient from "../apiClient";

// Initial Sample Inspection API
// Mirrors the quality API convention used in this app.
// The backend persists the header, first article details and summary in a
// single transaction ... (server-side validation).

const initialSampleInspectionAPI = {
  // Get Initial Sample Inspections by Organization ID
  getInitialSampleInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialSampleInspectionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.initialSampleInspectionVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching initial sample inspections:", error);
      throw error;
    }
  },

  // Get Initial Sample Inspection by ID
  getInitialSampleInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialSampleInspectionById?id=${id}`,
      );
      return res?.paramObjectsMap?.initialSampleInspectionVO || null;
    } catch (error) {
      console.error("Error fetching initial sample inspection by ID:", error);
      throw error;
    }
  },

  // Create / Update Initial Sample Inspection
  createUpdateInitialSampleInspection: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateInitialSampleInspection`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving initial sample inspection:", error);
      throw error;
    }
  },
};

export default initialSampleInspectionAPI;