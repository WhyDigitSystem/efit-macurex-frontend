// initialStageInspectionAPI.js
import apiClient from "../apiClient";

// Initial Stage Inspection API
// Mirrors the quality API convention used in this app.
// The backend persists the header, first article details and summary in a
// single transaction ... (server-side validation).

const initialStageInspectionAPI = {
  // Get Initial Stage Inspections by Organization ID
  getInitialStageInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialStageInspectionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.initialStageInspectionVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching initial stage inspections:", error);
      throw error;
    }
  },

  // Get Initial Stage Inspection by ID
  getInitialStageInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialStageInspectionById?id=${id}`,
      );
      return res?.paramObjectsMap?.initialStageInspectionVO || null;
    } catch (error) {
      console.error("Error fetching initial stage inspection by ID:", error);
      throw error;
    }
  },

  // Create / Update Initial Stage Inspection
  createUpdateInitialStageInspection: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateInitialStageInspection`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving initial stage inspection:", error);
      throw error;
    }
  },
};

export default initialStageInspectionAPI;